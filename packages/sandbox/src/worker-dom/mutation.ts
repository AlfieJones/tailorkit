import type { Element } from "./element.js";
import type { Node } from "./node.js";
import type { Text } from "./text.js";

export type MutationRecord =
  | { type: "insert"; parent: Node; child: Node; before: Node | null }
  | { type: "remove"; parent: Node; child: Node }
  | { type: "setAttribute"; element: Element; ns: string | null; name: string; value: string }
  | { type: "setEventListeners"; element: Element }
  | { type: "setProperty"; element: Element; name: string; value: unknown }
  | { type: "removeAttribute"; element: Element; ns: string | null; name: string }
  | { type: "setText"; node: Text; value: string };

export type MutationHandler = (record: MutationRecord) => void;

export function setMutationHandler(node: Node, handler: MutationHandler | null): void {
  node.__onMutation = handler;
}

export function emitMutation(node: Node, record: MutationRecord): void {
  let current: Node | null = node;
  while (current) {
    if (current.__onMutation) {
      current.__onMutation(record);
      return;
    }
    current = current.parentNode;
  }
}
