import type { MutationHandler } from "./mutation.js";
import { setMutationHandler } from "./mutation.js";
import { assign } from "./util.js";
import { NodeType } from "./types.js";
import { Element } from "./element.js";
import { Text } from "./text.js";
import { DomEvent } from "./event.js";
import { Node } from "./node.js";
import { requestAnimationFrame, cancelAnimationFrame } from "./animation.js";

export class Document extends Element {
  defaultView: Record<string, unknown> = {};
  documentElement: Element | null = null;
  head: Element | null = null;
  body: Element | null = null;

  constructor() {
    super(NodeType.DOCUMENT);
    this.ownerDocument = this;
  }

  createElement(type: string): Element {
    const element = new Element(null, String(type).toUpperCase());
    element.ownerDocument = this;
    return element;
  }

  createElementNS(ns: string, type: string, _options?: unknown): Element {
    const element = new Element(null, String(type).toUpperCase(), ns);
    element.ownerDocument = this;
    return element;
  }

  createTextNode(text: unknown): Text {
    const node = new Text(text);
    node.ownerDocument = this;
    return node;
  }

  setMutationHandler(handler: MutationHandler | null): void {
    setMutationHandler(this, handler);
  }
}

export function createDocument(): Document {
  const doc = new Document();
  const defaultView = {
    document: doc,
    Document,
    Node,
    Text,
    Element,
    Event: DomEvent,
    requestAnimationFrame,
    cancelAnimationFrame,
  };
  assign(defaultView, { window: defaultView });
  doc.defaultView = defaultView;
  assign(doc, defaultView);
  doc.append((doc.documentElement = doc.createElement("html")));
  doc.documentElement.append((doc.head = doc.createElement("head")));
  doc.documentElement.append((doc.body = doc.createElement("body")));
  return doc;
}
