export { DomEvent } from "./event.js";
export { Element, isElement } from "./element.js";
export { StyleDeclaration, createStyleDeclaration } from "./style.js";
export { Node } from "./node.js";
export { Text } from "./text.js";
export { Document, createDocument } from "./document.js";
export type { MutationHandler, MutationRecord } from "./mutation.js";
export type { Attribute, DomEventLike, EventHandler } from "./types.js";
export {
  requestAnimationFrame,
  cancelAnimationFrame,
  fireAnimationFrame,
  setAnimationPostMessage,
} from "./animation.js";

export { createDocument as default } from "./document.js";
