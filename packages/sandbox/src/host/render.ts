import type { RemoteElementNode } from "../protocol.js";
import type { HostRenderer } from "./store.js";

export type CreateElement<TRenderedNode> = (
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: TRenderedNode[]
) => TRenderedNode;

export interface ElementHostRendererOptions {
  components?: Record<string, unknown>;
  fragment?: unknown;
  onEvent?: (node: RemoteElementNode, event: string, eventPayload: unknown) => void;
}

export function createElementHostRenderer<TRenderedNode>(
  createElement: CreateElement<TRenderedNode>,
  options: ElementHostRendererOptions = {},
): HostRenderer<TRenderedNode> {
  const fragment = options.fragment ?? "fragment";

  return {
    renderElement(node, children) {
      return createElement(
        options.components?.[node.type] ?? node.type,
        {
          ...node.props,
          ...createEventProps(node, options.onEvent),
        },
        ...children,
      );
    },
    renderFragment(_node, children) {
      return createElement(fragment, null, ...children);
    },
    renderText(text) {
      return text as TRenderedNode;
    },
  };
}

function createEventProps(
  node: RemoteElementNode,
  onEvent: ElementHostRendererOptions["onEvent"],
): Record<string, unknown> {
  if (!onEvent || !node.events) {
    return {};
  }
  const props: Record<string, unknown> = {};
  for (const binding of node.events) {
    props[toEventProp(binding.event)] = (eventPayload: unknown) => {
      onEvent(node, binding.event, eventPayload);
    };
  }
  return props;
}

function toEventProp(event: string): string {
  return `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;
}
