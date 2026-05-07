import { describe, expect, it } from "vitest";
import { createDocument, Document } from "../document.js";
import { Element } from "../element.js";
import { DomEvent } from "../event.js";
import { Node } from "../node.js";
import { Text } from "../text.js";
import { happyDoc } from "./helpers.js";

describe("Document", () => {
  describe("createElement", () => {
    it("creates an Element with uppercased tag name", () => {
      const doc = new Document();
      const el = doc.createElement("div");
      expect(el).toBeInstanceOf(Element);
      expect(el.nodeName).toBe("DIV");
    });

    it("matches happy-dom: tagName is uppercase", () => {
      const happyEl = happyDoc.createElement("span");
      const doc = new Document();
      const el = doc.createElement("span");
      expect(el.nodeName).toBe(happyEl.tagName);
    });
  });

  describe("createElementNS", () => {
    it("creates an Element with the given namespace", () => {
      const doc = new Document();
      const ns = "http://www.w3.org/2000/svg";
      const el = doc.createElementNS(ns, "svg");
      expect(el.namespaceURI).toBe(ns);
      expect(el.nodeName).toBe("SVG");
    });
  });

  describe("createTextNode", () => {
    it("creates a Text node", () => {
      const doc = new Document();
      const text = doc.createTextNode("hello");
      expect(text).toBeInstanceOf(Text);
      expect(text.nodeValue).toBe("hello");
    });
  });
});

describe("createDocument", () => {
  it("returns a Document instance", () => {
    expect(createDocument()).toBeInstanceOf(Document);
  });

  it("sets up html > head + body tree", () => {
    const doc = createDocument();
    expect(doc.documentElement).toBeDefined();
    expect(doc.documentElement?.nodeName).toBe("HTML");
    expect(doc.head).toBeDefined();
    expect(doc.head?.nodeName).toBe("HEAD");
    expect(doc.body).toBeDefined();
    expect(doc.body?.nodeName).toBe("BODY");
  });

  it("head and body are children of documentElement", () => {
    const doc = createDocument();
    const htmlChildren = doc.documentElement?.children ?? [];
    expect(htmlChildren).toContain(doc.head);
    expect(htmlChildren).toContain(doc.body);
  });

  it("exposes Node, Text, Element, Event, and document on defaultView", () => {
    const doc = createDocument();
    expect(doc.defaultView["Node"]).toBe(Node);
    expect(doc.defaultView["Text"]).toBe(Text);
    expect(doc.defaultView["Element"]).toBe(Element);
    expect(doc.defaultView["Event"]).toBe(DomEvent);
    expect(doc.defaultView["document"]).toBe(doc);
  });

  it("matches happy-dom: documentElement is an element node", () => {
    const doc = createDocument();
    expect(doc.documentElement?.nodeType).toBe(happyDoc.documentElement.nodeType);
  });
});
