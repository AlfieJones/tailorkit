import {
  Fragment,
  createElement,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { createWorkerUiHost } from "@tailorkit/sandbox/host";
import type { HostToWorkerPayload, RemoteElementNode } from "@tailorkit/sandbox/protocol";
import { NodeStore } from "./node-store";
import { RemoteUIContext } from "./remote-context";
import type { RemoteViewContext } from "./remote-context";
import { toReactEventName, toReactProps } from "./render-utils";

interface RemoteViewHostProps {
  appUrl: string | URL;
  components: Record<string, unknown>;
  createWorker?: (url: URL, options: WorkerOptions) => Worker;
  props?: Record<string, unknown>;
  workerUrl?: string | URL;
}

export function RemoteViewHost({
  appUrl,
  components,
  createWorker,
  props,
  workerUrl,
}: RemoteViewHostProps): ReactNode {
  const storeRef = useRef<NodeStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = new NodeStore();
  }
  const store = storeRef.current;

  const dispatchRef = useRef<((payload: HostToWorkerPayload) => void) | null>(null);
  const [, setStatus] = useState<"error" | "ready" | "starting">("starting");

  const ctxRef = useRef<RemoteViewContext>({
    components,
    dispatch: (payload) => dispatchRef.current?.(payload),
    store,
  });

  useEffect(() => {
    ctxRef.current.components = components;
  }, [components]);

  const ui = useMemo(() => {
    const ctx = ctxRef.current;
    return createElement(
      RemoteUIContext.Provider,
      { value: ctx },
      createElement(RemoteRoot, { store: ctx.store }),
    );
  }, []);

  useEffect(() => {
    const host = createWorkerUiHost(appUrl, {
      createWorker,
      onError: () => {
        setStatus("error");
      },
      props,
      workerUrl,
    });

    dispatchRef.current = (payload) => host.dispatch(payload);

    const unsubscribe = host.subscribe(() => {
      const tree = host.getSnapshot();
      if (tree !== null) {
        store.setSnapshot(tree);
        setStatus("ready");
      }
    });

    setStatus("starting");
    host.mount();

    return () => {
      unsubscribe();
      dispatchRef.current = null;
      host.worker.terminate();
    };
  }, [appUrl, createWorker, props, workerUrl, store]);

  return ui;
}

interface RemoteRootProps {
  store: RemoteViewContext["store"];
}

function RemoteRoot({ store }: RemoteRootProps): ReactNode {
  const subscribe = useCallback((listener: () => void) => store.subscribeRoot(listener), [store]);
  const getSnapshot = useCallback(() => store.getRootId(), [store]);

  const rootId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (rootId === null) {
    return null;
  }

  return <RemoteView nodeId={rootId} />;
}

interface RemoteElementViewProps {
  ctx: RemoteViewContext;
  node: RemoteElementNode;
}

const RemoteElementView = memo(function RemoteElementView({
  ctx,
  node,
}: RemoteElementViewProps): ReactNode {
  const { dispatch, components } = ctx;

  const children = node.children.map((child) => <RemoteView key={child.id} nodeId={child.id} />);

  const component = components[node.type];

  if (component === undefined) {
    const props: Record<string, unknown> = { ...toReactProps(node.props) };

    for (const binding of node.events ?? []) {
      props[toReactEventName(binding.event)] = (event?: Event) => {
        const target = event?.target as HTMLInputElement | null | undefined;
        dispatch({
          data: {
            checked: target?.checked,
            key: event && "key" in event ? String(event.key) : undefined,
            nodeId: node.id,
            type: binding.event,
            value: target?.value,
          },
          type: "dispatchEvent",
        });
      };
    }

    return createElement(node.type, props, ...children);
  }

  const props: Record<string, unknown> = { ...node.props };

  for (const binding of node.events ?? []) {
    props[toReactEventName(binding.event)] = (event?: Event) => {
      const target = event?.target as HTMLInputElement | null | undefined;
      dispatch({
        data: {
          checked: target?.checked,
          key: event && "key" in event ? String(event.key) : undefined,
          nodeId: node.id,
          type: binding.event,
          value: target?.value,
        },
        type: "dispatchEvent",
      });
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement(component as any, props, ...children);
});

interface RemoteViewProps {
  nodeId: string;
}

export const RemoteView = memo(function RemoteView({ nodeId }: RemoteViewProps): ReactNode {
  const ctx = useContext(RemoteUIContext);
  if (ctx === null) {
    return null;
  }

  const { store } = ctx;

  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(nodeId, listener),
    [store, nodeId],
  );
  const getSnapshot = useCallback(() => store.getNode(nodeId), [store, nodeId]);

  const node = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (node === null) {
    return null;
  }

  if (node.kind === "text") {
    return node.text as unknown as ReactNode;
  }

  const childElements = node.children.map((child) => (
    <RemoteView key={child.id} nodeId={child.id} />
  ));

  if (node.kind === "fragment") {
    return createElement(Fragment, { key: node.id }, ...childElements);
  }

  return <RemoteElementView node={node} ctx={ctx} />;
});
