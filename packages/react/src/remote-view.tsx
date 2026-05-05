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
import { sanitizeProps, toReactEventName, toReactProps } from "./render-utils";

const defaultBlockedElements = new Set([
  "applet",
  "base",
  "body",
  "embed",
  "form",
  "frame",
  "frameset",
  "head",
  "html",
  "iframe",
  "link",
  "math",
  "meta",
  "object",
  "param",
  "script",
  "style",
  "svg",
  "title",
]);

const renderError = (message: string): ReactNode =>
  createElement(
    "pre",
    {
      role: "alert",
      style: {
        background: "#fff1f0",
        border: "1px solid #ffccc7",
        borderRadius: 6,
        color: "#8a1f11",
        margin: 0,
        padding: 12,
        whiteSpace: "pre-wrap",
      },
    },
    message,
  );

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

  const elementName = node.type.toLowerCase();
  const isCustomComponent = elementName.includes("-") || elementName in components;
  const component = components[node.type];

  if (component === undefined && defaultBlockedElements.has(elementName)) {
    return renderError(`Blocked remote element "${elementName}".`);
  }

  // Native elements: sanitize props and block dangerous values
  if (component === undefined) {
    const sanitized = sanitizeProps(node.props);
    if (sanitized.error !== null) {
      return renderError(sanitized.error);
    }

    const props: Record<string, unknown> = { ...toReactProps(sanitized.props) };

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

  // Custom components: pass props through as-is (data only, no dangerous values in sandbox)
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

  void isCustomComponent;
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
