import {
  Component,
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

const formatError = (error: Error): string => error.message;

interface RemoteErrorBoundaryProps {
  children?: ReactNode;
}

interface RemoteErrorBoundaryState {
  error: Error | null;
}

class RemoteErrorBoundary extends Component<RemoteErrorBoundaryProps, RemoteErrorBoundaryState> {
  state: RemoteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RemoteErrorBoundaryState {
    return { error };
  }

  static componentDidCatch(error: Error): void {
    console.error("TailorKit remote app failed", error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return createElement("div", null, formatError(this.state.error));
    }

    return this.props.children;
  }
}

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
  const appKey = appUrl.toString();
  const storeRef = useRef<NodeStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = new NodeStore();
  }
  const store = storeRef.current;
  const appKeyRef = useRef(appKey);
  if (appKeyRef.current !== appKey) {
    appKeyRef.current = appKey;
    store.clear();
  }

  const dispatchRef = useRef<((payload: HostToWorkerPayload) => void) | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"error" | "ready" | "starting">("starting");

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
      createElement(
        RemoteErrorBoundary,
        { key: appKey },
        createElement(RemoteRoot, { store: ctx.store }),
      ),
    );
  }, [appKey]);

  useEffect(() => {
    const host = createWorkerUiHost(appUrl, {
      createWorker,
      onError: (error) => {
        console.error("TailorKit remote app failed", error);
        setError(error);
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
    setError(null);
    host.mount();

    return () => {
      unsubscribe();
      dispatchRef.current = null;
      host.worker.terminate();
    };
  }, [appUrl, createWorker, props, workerUrl, store]);

  if (status === "error" && error) {
    return createElement("div", null, formatError(error));
  }

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
    throw new Error(`TailorKit component "${node.type}" is not registered.`);
  }

  const props: Record<string, unknown> = { ...node.props };

  for (const binding of node.callbacks ?? []) {
    props[binding.callback] = (...args: unknown[]) => {
      dispatch({
        data: {
          args: args.slice(0, binding.inputCount),
          event: binding.event,
          nodeId: node.id,
        },
        type: "dispatchCallback",
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
