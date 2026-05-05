import { Window } from "happy-dom";
import { Element } from "../element.js";

export const happyWindow = new Window();
export const happyDoc = happyWindow.document;

export function makeElement(tag = "div"): Element {
  return new Element(null, tag.toUpperCase());
}
