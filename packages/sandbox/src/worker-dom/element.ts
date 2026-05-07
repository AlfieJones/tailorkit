import { toLower } from "./util.js";
import { NodeType } from "./types.js";
import type { Attribute, EventHandler } from "./types.js";
import type { DomEvent } from "./event.js";
import { emitMutation } from "./mutation.js";
import { Node } from "./node.js";
import { createStyleDeclaration } from "./style.js";

export function isElement(node: Node): node is Element {
  return node.nodeType === NodeType.ELEMENT;
}

export class Element extends Node {
  attributes: Attribute[];
  __handlers: Record<string, EventHandler[]>;
  style: Record<string, string> & {
    cssText: string;
    setProperty(name: string, value: string | number | null | undefined): void;
  };
  namespaceURI: string;

  constructor(
    nodeType: number | null,
    nodeName?: string,
    namespaceURI = "http://www.w3.org/1999/xhtml",
  ) {
    super(nodeType ?? NodeType.ELEMENT, nodeName);
    this.attributes = [];
    this.__handlers = {};
    this.namespaceURI = namespaceURI;
    this.style = createStyleDeclaration(this);
  }

  get tagName(): string {
    return this.nodeName;
  }

  get localName(): string {
    return this.nodeName.toLowerCase();
  }

  get cssText(): string | null {
    return this.style.cssText || null;
  }

  set cssText(val: string) {
    this.style.cssText = val;
  }

  get children(): Element[] {
    return this.childNodes.filter(isElement);
  }

  setAttribute(key: string, value: string): void {
    this.setAttributeNS(null, key, value);
  }

  getAttribute(key: string): string | null {
    return this.getAttributeNS(null, key);
  }

  removeAttribute(key: string): void {
    this.removeAttributeNS(null, key);
  }

  setAttributeNS(ns: string | null, name: string, value: string): void {
    let attr = this.attributes[findAttributeIndex(this.attributes, ns, name)];
    if (!attr) {
      attr = { ns, name, value: "" };
      this.attributes.push(attr);
    }
    attr.value = String(value);
    emitMutation(this, { type: "setAttribute", element: this, ns, name, value: attr.value });
  }

  getAttributeNS(ns: string | null, name: string): string | null {
    const attr = this.attributes[findAttributeIndex(this.attributes, ns, name)];
    return attr?.value ?? null;
  }

  removeAttributeNS(ns: string | null, name: string): void {
    const index = findAttributeIndex(this.attributes, ns, name);
    if (index !== -1) {
      this.attributes.splice(index, 1);
      emitMutation(this, { type: "removeAttribute", element: this, ns, name });
    }
  }

  addEventListener(type: string, handler: EventHandler, _options?: unknown): void {
    const key = toLower(type);
    (this.__handlers[key] ??= []).push(handler);
    emitMutation(this, { type: "setEventListeners", element: this });
  }

  removeEventListener(type: string, handler: EventHandler): void {
    const handlers = this.__handlers[toLower(type)];
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        emitMutation(this, { type: "setEventListeners", element: this });
      }
    }
  }

  dispatchEvent(event: DomEvent): boolean {
    event.target = this;
    const type = toLower(event.type);

    const invoke = (el: Element): void => {
      event.currentTarget = el;
      const handlers = el.__handlers[type];
      if (handlers) {
        for (const handler of handlers) {
          if ((handler?.call(el, event) === false || event._end) && event.cancelable) {
            event.defaultPrevented = true;
          }
          if (event._end) {
            return;
          }
        }
      }
    };

    invoke(this);

    if (event.bubbles) {
      let current = this.parentNode;
      while (current instanceof Element && !event._stop) {
        invoke(current);
        current = current.parentNode;
      }
    }

    return !event.defaultPrevented;
  }
}

function findAttributeIndex(attributes: Attribute[], ns: string | null, name: string): number {
  const lowerName = toLower(name);
  return attributes.findIndex((attr) => attr.ns === ns && toLower(attr.name) === lowerName);
}
