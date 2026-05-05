import { describe, expect, it } from "vitest";
import { Text } from "../text.js";
import { NodeType } from "../types.js";
import { happyDoc } from "./helpers.js";

describe("Text", () => {
  it("has correct nodeType and nodeName", () => {
    const text = new Text("hello");
    expect(text.nodeType).toBe(NodeType.TEXT);
    expect(text.nodeName).toBe("#text");
  });

  it("stores nodeValue from constructor", () => {
    const text = new Text("world");
    expect(text.nodeValue).toBe("world");
  });

  it("textContent getter returns nodeValue", () => {
    const text = new Text("foo");
    expect(text.textContent).toBe("foo");
  });

  it("textContent setter updates nodeValue", () => {
    const text = new Text("foo");
    text.textContent = "bar";
    expect(text.nodeValue).toBe("bar");
    expect(text.textContent).toBe("bar");
  });

  it("matches happy-dom: text node nodeType is 3", () => {
    const happyText = happyDoc.createTextNode("hello");
    expect(happyText.nodeType).toBe(new Text("hello").nodeType);
  });
});
