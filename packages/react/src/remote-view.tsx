import {
  Fragment,
  createElement,
  memo,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { HostController } from "@tailorkit/sandbox-ui/host";
import type { RemoteElementNode } from "@tailorkit/sandbox-ui/protocol";
import { getRemoteComponentName } from "@tailorkit/sandbox-ui/protocol";
import type { NodeStore } from "./node-store";
import type { RemoteCallbackDefinitions } from "./render-utils";
import {
  createHostEvent,
  hydrateProps,
  sanitizeProps,
  toReactEventName,
  toReactProps,
} from "./render-utils";
import { RemoteUIContext } from "./ui-context";

export interface RemoteViewContext {
  callbackDefinitions?: RemoteCallbackDefinitions;
  components: Record<string, unknown>;
  controller: { current: HostController | null };
  onEventError?: (error: unknown) => void;
  store: NodeStore;
}

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

const slotElementName = "tailorkit-slot";
const remoteComponentErrorProp = "__tailorkitError";

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
  const { controller, components, callbackDefinitions, onEventError } = ctx;

  const children = node.children.map((child) => <RemoteView key={child.id} nodeId={child.id} />);

  const renderedSlots = node.slots
    ? Object.fromEntries(
        Object.entries(node.slots).map(([name, slotNodes]) => [
          name,
          slotNodes.map((sn) => <RemoteView key={sn.id} nodeId={sn.id} />),
        ]),
      )
    : undefined;

  const elementName = node.type.toLowerCase();
  const componentName = getRemoteComponentName(node.type);

  if (elementName === slotElementName) {
    const owner = typeof node.props.owner === "string" ? node.props.owner : "its owner";
    return renderError(
      `<${owner}.${String(node.props.name ?? "Slot")}> must be a direct child of <${owner}>.`,
    );
  }

  if (typeof node.props[remoteComponentErrorProp] === "string") {
    return renderError(node.props[remoteComponentErrorProp] as string);
  }

  if (componentName === null && defaultBlockedElements.has(elementName)) {
    return renderError(`Blocked remote element "${elementName}".`);
  }

  const sanitized = sanitizeProps(
    { ...node.props, key: node.key ?? node.id },
    { allowFunctionRefs: componentName !== null },
  );
  if (sanitized.error !== null) {
    return renderError(sanitized.error);
  }

  const ctrl = controller.current;
  if (ctrl === null) {
    return null;
  }

  const props =
    componentName === null
      ? sanitized.props
      : hydrateProps(sanitized.props, callbackDefinitions?.[componentName], ctrl, onEventError);

  for (const binding of node.events ?? []) {
    props[toReactEventName(binding.event)] = (event: Event) => {
      void (async () => {
        try {
          await ctrl.dispatchEvent(binding, createHostEvent(node, binding.event, event));
        } catch (error) {
          onEventError?.(error);
        }
      })();
    };
  }

  if (componentName === null) {
    return createElement(node.type, toReactProps(props), ...children);
  }

  const component = components[componentName];
  if (component === undefined) {
    return renderError(`Missing remote component "${componentName}".`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createElement(component as any, { ...props, slots: renderedSlots ?? {} }, ...children);
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
