/* eslint-disable unicorn/prefer-modern-dom-apis, unicorn/prefer-dom-node-remove */
import { describe, expect, it, vi } from "vitest";
import { Element, isElement } from "../element.js";
import { DomEvent } from "../event.js";
import { Node } from "../node.js";
import { Text } from "../text.js";
import { NodeType } from "../types.js";
import { happyDoc, makeElement } from "./helpers.js";

describe("isElement", () => {
  it("returns true for Element nodes", () => {
    expect(isElement(new Element(null, "DIV"))).toBe(true);
  });

  it("returns false for plain Node with non-element nodeType", () => {
    expect(isElement(new Node(NodeType.TEXT, "#text"))).toBe(false);
  });
});

describe("Element", () => {
  describe("constructor", () => {
    it("defaults nodeType to ELEMENT when null is passed", () => {
      const el = new Element(null, "DIV");
      expect(el.nodeType).toBe(NodeType.ELEMENT);
    });

    it("uses provided nodeType when non-null", () => {
      const el = new Element(NodeType.DOCUMENT, "#document");
      expect(el.nodeType).toBe(NodeType.DOCUMENT);
    });

    it("initialises attributes and __handlers as empty", () => {
      const el = new Element(null, "DIV");
      expect(el.attributes).toEqual([]);
      expect(el.__handlers).toEqual({});
      expect(el.style.cssText).toBe("");
    });
  });

  describe("setAttribute / getAttribute / removeAttribute", () => {
    it("sets and gets an attribute", () => {
      const el = makeElement();
      el.setAttribute("id", "main");
      expect(el.getAttribute("id")).toBe("main");
    });

    it("overwrites existing attribute", () => {
      const el = makeElement();
      el.setAttribute("aria-label", "first");
      el.setAttribute("aria-label", "second");
      expect(el.getAttribute("aria-label")).toBe("second");
    });

    it("returns null for missing attribute", () => {
      const el = makeElement();
      expect(el.getAttribute("missing")).toBeNull();
    });

    it("removes an attribute", () => {
      const el = makeElement();
      el.setAttribute("id", "x");
      el.removeAttribute("id");
      expect(el.getAttribute("id")).toBeNull();
    });

    it("matches happy-dom: getAttribute returns null for missing attributes", () => {
      const happyEl = happyDoc.createElement("div");
      const el = makeElement();

      expect(el.getAttribute("aria-label")).toBe(happyEl.getAttribute("aria-label"));

      happyEl.setAttribute("aria-label", "test");
      el.setAttribute("aria-label", "test");
      expect(el.getAttribute("aria-label")).toBe(happyEl.getAttribute("aria-label"));
    });
  });

  describe("setAttributeNS / getAttributeNS / removeAttributeNS", () => {
    it("sets and gets namespaced attribute", () => {
      const el = makeElement("svg");
      const ns = "http://www.w3.org/1999/xlink";
      el.setAttributeNS(ns, "href", "#target");
      expect(el.getAttributeNS(ns, "href")).toBe("#target");
    });

    it("distinguishes attributes by namespace", () => {
      const el = makeElement();
      el.setAttributeNS("ns1", "foo", "a");
      el.setAttributeNS("ns2", "foo", "b");
      expect(el.getAttributeNS("ns1", "foo")).toBe("a");
      expect(el.getAttributeNS("ns2", "foo")).toBe("b");
    });

    it("removes namespaced attribute", () => {
      const el = makeElement();
      const ns = "http://ns.example";
      el.setAttributeNS(ns, "bar", "val");
      el.removeAttributeNS(ns, "bar");
      expect(el.getAttributeNS(ns, "bar")).toBeNull();
    });
  });

  describe("cssText", () => {
    it("getter returns null when no style attribute", () => {
      expect(makeElement().cssText).toBeNull();
    });

    it("setter sets the style attribute", () => {
      const el = makeElement();
      el.cssText = "color: red;";
      expect(el.getAttribute("style")).toBe("color: red;");
    });

    it("supports object-style assignment used by Preact", () => {
      const el = makeElement();
      el.style["marginTop"] = "4px";
      el.style.setProperty("opacity", 0.5);
      expect(el.getAttribute("style")).toBe("margin-top: 4px; opacity: 0.5;");
    });
  });

  describe("children", () => {
    it("returns only element children, not text nodes", () => {
      const parent = new Element(null, "DIV");
      const child = new Element(null, "SPAN");
      const text = new Text("hello");
      parent.append(child);
      parent.append(text);
      expect(parent.children).toHaveLength(1);
      expect(parent.children[0]).toBe(child);
    });
  });

  describe("addEventListener / removeEventListener", () => {
    it("registers and removes a handler", () => {
      const el = makeElement();
      const handler = vi.fn();
      el.addEventListener("tailorkitcallbackonselect", handler);
      expect(el.__handlers["tailorkitcallbackonselect"]).toContain(handler);
      el.removeEventListener("tailorkitcallbackonselect", handler);
      expect(el.__handlers["tailorkitcallbackonselect"]).not.toContain(handler);
    });

    it("normalises event type to lowercase", () => {
      const el = makeElement();
      const handler = vi.fn();
      el.addEventListener("TailorKitCallbackOnSelect", handler);
      expect(el.__handlers["tailorkitcallbackonselect"]).toContain(handler);
    });

    it("supports multiple handlers for the same event", () => {
      const el = makeElement();
      const h1 = vi.fn();
      const h2 = vi.fn();
      el.addEventListener("tailorkitcallbackonselect", h1);
      el.addEventListener("tailorkitcallbackonselect", h2);
      expect(el.__handlers["tailorkitcallbackonselect"]).toHaveLength(2);
    });
  });

  describe("dispatchEvent", () => {
    it("invokes handler and sets target/currentTarget", () => {
      const el = makeElement();
      let capturedTarget: unknown;
      let capturedCurrentTarget: unknown;
      el.addEventListener("tailorkitcallbackonselect", (ev) => {
        capturedTarget = ev.target;
        capturedCurrentTarget = ev.currentTarget;
      });
      const ev = new DomEvent("tailorkitcallbackonselect");
      el.dispatchEvent(ev);
      expect(capturedTarget).toBe(el);
      expect(capturedCurrentTarget).toBe(el);
    });

    it("returns true when the event was not canceled", () => {
      const el = makeElement();
      el.addEventListener("tailorkitcallbackonselect", () => {});
      expect(el.dispatchEvent(new DomEvent("tailorkitcallbackonselect"))).toBe(true);
    });

    it("returns true when no handlers exist for the event type", () => {
      const el = makeElement();
      expect(el.dispatchEvent(new DomEvent("tailorkitcallbackonselect"))).toBe(true);
    });

    it("invokes handlers in registration order", () => {
      const el = makeElement();
      const order: number[] = [];
      el.addEventListener("tailorkitcallbackonselect", () => {
        order.push(1);
      });
      el.addEventListener("tailorkitcallbackonselect", () => {
        order.push(2);
      });
      el.dispatchEvent(new DomEvent("tailorkitcallbackonselect"));
      expect(order).toEqual([1, 2]);
    });

    it("sets defaultPrevented when handler returns false and event is cancelable", () => {
      const el = makeElement();
      el.addEventListener("tailorkitcallbackonselect", () => false);
      const ev = new DomEvent("tailorkitcallbackonselect", { cancelable: true });
      el.dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(true);
    });

    it("does NOT set defaultPrevented when event is not cancelable", () => {
      const el = makeElement();
      el.addEventListener("tailorkitcallbackonselect", () => false);
      const ev = new DomEvent("tailorkitcallbackonselect", { cancelable: false });
      el.dispatchEvent(ev);
      expect(ev.defaultPrevented).toBe(false);
    });

    describe("bubbling", () => {
      it("bubbles through ancestors when bubbles=true", () => {
        const parent = new Element(null, "DIV");
        const child = new Element(null, "SPAN");
        parent.append(child);

        const parentHandler = vi.fn();
        parent.addEventListener("tailorkitcallbackonselect", parentHandler);

        child.dispatchEvent(new DomEvent("tailorkitcallbackonselect", { bubbles: true }));
        expect(parentHandler).toHaveBeenCalledOnce();
      });

      it("does not bubble when bubbles=false", () => {
        const parent = new Element(null, "DIV");
        const child = new Element(null, "SPAN");
        parent.append(child);

        const parentHandler = vi.fn();
        parent.addEventListener("tailorkitcallbackonselect", parentHandler);

        child.dispatchEvent(new DomEvent("tailorkitcallbackonselect", { bubbles: false }));
        expect(parentHandler).not.toHaveBeenCalled();
      });

      it("stops bubbling after stopPropagation on a cancelable event", () => {
        const grandparent = new Element(null, "DIV");
        const parent = new Element(null, "DIV");
        const child = new Element(null, "SPAN");
        grandparent.append(parent);
        parent.append(child);

        const parentHandler = vi.fn((ev: { stopPropagation: () => void }) => {
          ev.stopPropagation();
        });
        const grandparentHandler = vi.fn();
        parent.addEventListener("tailorkitcallbackonselect", parentHandler);
        grandparent.addEventListener("tailorkitcallbackonselect", grandparentHandler);

        child.dispatchEvent(
          new DomEvent("tailorkitcallbackonselect", { bubbles: true, cancelable: true }),
        );

        expect(parentHandler).toHaveBeenCalledOnce();
        expect(grandparentHandler).not.toHaveBeenCalled();
      });

      it("stops bubbling on non-cancelable events after stopPropagation", () => {
        const grandparent = new Element(null, "DIV");
        const parent = new Element(null, "DIV");
        const child = new Element(null, "SPAN");
        grandparent.append(parent);
        parent.append(child);

        const parentHandler = vi.fn((ev: { stopPropagation: () => void }) => {
          ev.stopPropagation();
        });
        const grandparentHandler = vi.fn();
        parent.addEventListener("tailorkitcallbackonselect", parentHandler);
        grandparent.addEventListener("tailorkitcallbackonselect", grandparentHandler);

        child.dispatchEvent(
          new DomEvent("tailorkitcallbackonselect", { bubbles: true, cancelable: false }),
        );

        expect(grandparentHandler).not.toHaveBeenCalled();
      });

      it("fires child handler before parent handler (target phase first)", () => {
        const parent = new Element(null, "DIV");
        const child = new Element(null, "SPAN");
        parent.append(child);

        const order: string[] = [];
        child.addEventListener("tailorkitcallbackonselect", () => {
          order.push("child");
        });
        parent.addEventListener("tailorkitcallbackonselect", () => {
          order.push("parent");
        });

        child.dispatchEvent(new DomEvent("tailorkitcallbackonselect", { bubbles: true }));
        expect(order).toEqual(["child", "parent"]);
      });
    });
  });
});
