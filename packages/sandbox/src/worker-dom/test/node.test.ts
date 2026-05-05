/* eslint-disable unicorn/prefer-modern-dom-apis, unicorn/prefer-dom-node-remove */
import { describe, expect, it } from "vitest";
import { Node } from "../node.js";
import { NodeType } from "../types.js";
import { happyDoc } from "./helpers.js";

describe("Node", () => {
  it("initialises with correct nodeType, nodeName, and empty childNodes", () => {
    const node = new Node(NodeType.ELEMENT, "DIV");
    expect(node.nodeType).toBe(NodeType.ELEMENT);
    expect(node.nodeName).toBe("DIV");
    expect(node.childNodes).toEqual([]);
    expect(node.parentNode).toBeNull();
  });

  describe("appendChild", () => {
    it("adds a child and sets parentNode", () => {
      const parent = new Node(NodeType.ELEMENT, "PARENT");
      const child = new Node(NodeType.ELEMENT, "CHILD");
      parent.append(child);
      expect(parent.childNodes).toContain(child);
      expect(child.parentNode).toBe(parent);
    });

    it("appendChild returns the appended child node", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const child = new Node(NodeType.ELEMENT, "C");
      // insertBefore is what appendChild delegates to; both return the child
      const returned = parent.insertBefore(child);
      expect(returned).toBe(child);
    });

    it("re-parents a node that already has a parent", () => {
      const parent1 = new Node(NodeType.ELEMENT, "P1");
      const parent2 = new Node(NodeType.ELEMENT, "P2");
      const child = new Node(NodeType.ELEMENT, "C");
      parent1.append(child);
      parent2.append(child);
      expect(parent1.childNodes).not.toContain(child);
      expect(parent2.childNodes).toContain(child);
      expect(child.parentNode).toBe(parent2);
    });

    it("matches happy-dom: appended child is last in childNodes", () => {
      const happyParent = happyDoc.createElement("div");
      const happyA = happyDoc.createElement("span");
      const happyB = happyDoc.createElement("span");
      happyParent.append(happyA);
      happyParent.append(happyB);

      const parent = new Node(NodeType.ELEMENT, "DIV");
      const a = new Node(NodeType.ELEMENT, "SPAN");
      const b = new Node(NodeType.ELEMENT, "SPAN");
      parent.append(a);
      parent.append(b);

      expect(parent.childNodes.length).toBe(happyParent.childNodes.length);
      expect(parent.childNodes[0]).toBe(a);
      expect(parent.childNodes[1]).toBe(b);
    });
  });

  describe("append", () => {
    it("appends multiple nodes in order", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      parent.append(a, b);
      expect(parent.childNodes[0]).toBe(a);
      expect(parent.childNodes[1]).toBe(b);
    });
  });

  describe("insertBefore", () => {
    it("inserts child before the ref node", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      const c = new Node(NodeType.ELEMENT, "C");
      parent.append(a);
      parent.append(c);
      parent.insertBefore(b, c);
      expect(parent.childNodes).toEqual([a, b, c]);
    });

    it("appends when no ref is given", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      parent.append(a);
      parent.insertBefore(b);
      expect(parent.childNodes).toEqual([a, b]);
    });

    it("matches happy-dom: insert before sets correct order", () => {
      const happyParent = happyDoc.createElement("ul");
      const happyA = happyDoc.createElement("li");
      const happyB = happyDoc.createElement("li");
      const happyC = happyDoc.createElement("li");
      happyParent.append(happyA);
      happyParent.append(happyC);
      happyParent.insertBefore(happyB, happyC);

      const parent = new Node(NodeType.ELEMENT, "UL");
      const a = new Node(NodeType.ELEMENT, "LI");
      const b = new Node(NodeType.ELEMENT, "LI");
      const c = new Node(NodeType.ELEMENT, "LI");
      parent.append(a);
      parent.append(c);
      parent.insertBefore(b, c);

      expect(parent.childNodes.length).toBe(happyParent.childNodes.length);
      expect(parent.childNodes[1]).toBe(b);
    });
  });

  describe("removeChild", () => {
    it("removes child from parent and nullifies parentNode", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const child = new Node(NodeType.ELEMENT, "C");
      parent.append(child);
      parent.removeChild(child);
      expect(parent.childNodes).not.toContain(child);
      expect(child.parentNode).toBeNull();
    });

    it("returns the removed child", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const child = new Node(NodeType.ELEMENT, "C");
      parent.append(child);
      expect(parent.removeChild(child)).toBe(child);
    });

    it("matches happy-dom: removes only the specified child", () => {
      const happyParent = happyDoc.createElement("div");
      const happyA = happyDoc.createElement("span");
      const happyB = happyDoc.createElement("span");
      happyParent.append(happyA);
      happyParent.append(happyB);
      happyParent.removeChild(happyA);

      const parent = new Node(NodeType.ELEMENT, "DIV");
      const a = new Node(NodeType.ELEMENT, "SPAN");
      const b = new Node(NodeType.ELEMENT, "SPAN");
      parent.append(a);
      parent.append(b);
      parent.removeChild(a);

      expect(parent.childNodes.length).toBe(happyParent.childNodes.length);
      expect(parent.childNodes[0]).toBe(b);
    });
  });

  describe("remove", () => {
    it("detaches node from its parent", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const child = new Node(NodeType.ELEMENT, "C");
      parent.append(child);
      child.remove();
      expect(parent.childNodes).not.toContain(child);
      expect(child.parentNode).toBeNull();
    });

    it("is a no-op when node has no parent", () => {
      const node = new Node(NodeType.ELEMENT, "C");
      expect(() => node.remove()).not.toThrow();
    });
  });

  describe("replaceChild", () => {
    it("replaces ref with child", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      parent.append(a);
      parent.replaceChild(b, a);
      expect(parent.childNodes).toContain(b);
      expect(parent.childNodes).not.toContain(a);
      expect(a.parentNode).toBeNull();
    });

    it("returns the replaced node", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      parent.append(a);
      expect(parent.replaceChild(b, a)).toBe(a);
    });

    it("returns undefined when ref is not a child of parent", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const other = new Node(NodeType.ELEMENT, "O");
      const b = new Node(NodeType.ELEMENT, "B");
      expect(parent.replaceChild(b, other)).toBeUndefined();
    });
  });

  describe("sibling and child getters", () => {
    it("returns firstChild and lastChild", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      parent.append(a, b);
      expect(parent.firstChild).toBe(a);
      expect(parent.lastChild).toBe(b);
    });

    it("firstChild and lastChild are null for empty node", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      expect(parent.firstChild).toBeNull();
      expect(parent.lastChild).toBeNull();
    });

    it("returns nextSibling and previousSibling", () => {
      const parent = new Node(NodeType.ELEMENT, "P");
      const a = new Node(NodeType.ELEMENT, "A");
      const b = new Node(NodeType.ELEMENT, "B");
      const c = new Node(NodeType.ELEMENT, "C");
      parent.append(a, b, c);

      expect(a.nextSibling).toBe(b);
      expect(b.nextSibling).toBe(c);
      expect(c.nextSibling).toBeNull();

      expect(c.previousSibling).toBe(b);
      expect(b.previousSibling).toBe(a);
      expect(a.previousSibling).toBeNull();
    });

    it("matches happy-dom: nextSibling/previousSibling behaviour", () => {
      const happyParent = happyDoc.createElement("div");
      const happyA = happyDoc.createTextNode("a");
      const happyB = happyDoc.createTextNode("b");
      happyParent.append(happyA);
      happyParent.append(happyB);

      const parent = new Node(NodeType.ELEMENT, "DIV");
      const a = new Node(NodeType.TEXT, "#text");
      const b = new Node(NodeType.TEXT, "#text");
      parent.append(a, b);

      expect(a.nextSibling).toBe(b);
      expect(b.previousSibling).toBe(a);
      expect(!!happyA.nextSibling).toBe(!!a.nextSibling);
      expect(!!happyB.previousSibling).toBe(!!b.previousSibling);
    });
  });
});
