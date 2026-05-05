import {
  Fragment,
  createElement,
  memo,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { RemoteElementNode } from "@tailorkit/sandbox/protocol";
import { RemoteUIContext } from "./remote-context";
import type { RemoteViewContext } from "./remote-context";
import { toReactEventName, toReactProps } from "./render-utils";

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
