/* eslint-disable unicorn/prefer-dom-node-remove */
import { describe, expect, it, vi } from "vitest";
import { createDocument } from "../document.js";
import { Element } from "../element.js";
import type { MutationRecord } from "../mutation.js";
import { Node } from "../node.js";
import { Text } from "../text.js";
import { NodeType } from "../types.js";

type MutationMock = ReturnType<typeof vi.fn<(record: MutationRecord) => void>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup() {
  const doc = createDocument();
  const handler = vi.fn<(record: MutationRecord) => void>();
  doc.setMutationHandler(handler);
  return { doc, handler };
}

/** Return the first call argument of the most recent handler invocation. */
function lastRecord(handler: MutationMock): MutationRecord {
  const call = handler.mock.lastCall;
  if (!call) {
    throw new Error("handler was never called");
  }
  return call[0] as MutationRecord;
}

/** Return all call arguments collected so far. */
function allRecords(handler: MutationMock): MutationRecord[] {
  return handler.mock.calls.map((c) => c[0] as MutationRecord);
}

// ---------------------------------------------------------------------------
// setMutationHandler
// ---------------------------------------------------------------------------

describe("setMutationHandler", () => {
  it("notifies for mutations inside the attached tree", () => {
    const doc = createDocument();
    const child = doc.createElement("div");
    doc.body?.append(child);

    const handler = vi.fn<(record: MutationRecord) => void>();
    doc.setMutationHandler(handler);

    child.setAttribute("id", "test");
    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("setAttribute");
  });

  it("clears the handler when called with null", () => {
    const { doc, handler } = setup();
    doc.setMutationHandler(null);
    doc.body?.append(doc.createElement("div"));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// insert
// ---------------------------------------------------------------------------

describe("insert mutation", () => {
  it("fires when a child is appended", () => {
    const { doc, handler } = setup();
    const child = doc.createElement("div");
    doc.body?.append(child);

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("insert");
    if (rec.type === "insert") {
      expect(rec.child).toBe(child);
      expect(rec.parent).toBe(doc.body);
      expect(rec.before).toBeNull();
    }
  });

  it("fires with the correct before ref when insertBefore is used", () => {
    const { doc, handler } = setup();
    const a = doc.createElement("div");
    const b = doc.createElement("div");
    doc.body?.append(a);
    handler.mockClear();

    doc.body?.insertBefore(b, a);

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("insert");
    if (rec.type === "insert") {
      expect(rec.child).toBe(b);
      expect(rec.before).toBe(a);
    }
  });

  it("fires a remove then insert when a node is moved between parents", () => {
    const { doc, handler } = setup();
    const child = doc.createElement("span");
    const container = doc.createElement("div");
    doc.body?.append(container);
    doc.body?.append(child);
    handler.mockClear();

    container.append(child);

    const records = allRecords(handler);
    expect(records).toHaveLength(2);
    expect(records[0]?.type).toBe("remove");
    expect(records[1]?.type).toBe("insert");
    if (records[0]?.type === "remove") {
      expect(records[0].child).toBe(child);
    }
    if (records[1]?.type === "insert") {
      expect(records[1].child).toBe(child);
      expect(records[1].parent).toBe(container);
    }
  });

  it("propagates the handler down to a newly inserted subtree", () => {
    const { doc, handler } = setup();
    const parent = doc.createElement("div");
    const child = doc.createElement("span");
    parent.append(child);
    doc.body?.append(parent);
    handler.mockClear();

    child.setAttribute("id", "x");
    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("setAttribute");
    if (rec.type === "setAttribute") {
      expect(rec.element).toBe(child);
    }
  });
});

// ---------------------------------------------------------------------------
// remove
// ---------------------------------------------------------------------------

describe("remove mutation", () => {
  it("fires when removeChild is called", () => {
    const { doc, handler } = setup();
    const child = doc.createElement("div");
    doc.body?.append(child);
    handler.mockClear();

    doc.body?.removeChild(child);

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("remove");
    if (rec.type === "remove") {
      expect(rec.child).toBe(child);
      expect(rec.parent).toBe(doc.body);
    }
  });

  it("fires when node.remove() is called", () => {
    const { doc, handler } = setup();
    const child = doc.createElement("div");
    doc.body?.append(child);
    handler.mockClear();

    child.remove();

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("remove");
    if (rec.type === "remove") {
      expect(rec.child).toBe(child);
    }
  });

  it("clears the handler on removed nodes so they stop firing", () => {
    const { doc, handler } = setup();
    const child = doc.createElement("div");
    doc.body?.append(child);
    doc.body?.removeChild(child);
    handler.mockClear();

    child.setAttribute("id", "orphan");
    expect(handler).not.toHaveBeenCalled();
  });

  it("clears the handler on the full removed subtree", () => {
    const { doc, handler } = setup();
    const parent = doc.createElement("div");
    const child = doc.createElement("span");
    parent.append(child);
    doc.body?.append(parent);
    doc.body?.removeChild(parent);
    handler.mockClear();

    child.setAttribute("id", "deep-orphan");
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// setAttribute / removeAttribute
// ---------------------------------------------------------------------------

describe("setAttribute mutation", () => {
  it("fires with correct fields", () => {
    const { doc, handler } = setup();
    const el = doc.createElement("tailorkit-button");
    doc.body?.append(el);
    handler.mockClear();

    el.setAttribute("aria-label", "close");

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("setAttribute");
    if (rec.type === "setAttribute") {
      expect(rec.element).toBe(el);
      expect(rec.ns).toBeNull();
      expect(rec.name).toBe("aria-label");
      expect(rec.value).toBe("close");
    }
  });

  it("fires for setAttributeNS", () => {
    const { doc, handler } = setup();
    const el = doc.createElement("tailorkit-icon-use");
    doc.body?.append(el);
    handler.mockClear();

    const ns = "http://www.w3.org/1999/xlink";
    el.setAttributeNS(ns, "href", "#icon");

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("setAttribute");
    if (rec.type === "setAttribute") {
      expect(rec.element).toBe(el);
      expect(rec.ns).toBe(ns);
      expect(rec.name).toBe("href");
      expect(rec.value).toBe("#icon");
    }
  });

  it("does not fire on elements not yet in the tree", () => {
    const { handler } = setup();
    const detached = new Element(null, "TAILORKIT-BOX");
    detached.setAttribute("id", "x");
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("removeAttribute mutation", () => {
  it("fires with correct fields", () => {
    const { doc, handler } = setup();
    const el = doc.createElement("tailorkit-input");
    el.setAttribute("disabled", "");
    doc.body?.append(el);
    handler.mockClear();

    el.removeAttribute("disabled");

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("removeAttribute");
    if (rec.type === "removeAttribute") {
      expect(rec.element).toBe(el);
      expect(rec.ns).toBeNull();
      expect(rec.name).toBe("disabled");
    }
  });
});

// ---------------------------------------------------------------------------
// setText
// ---------------------------------------------------------------------------

describe("setText mutation", () => {
  it("fires when textContent is set on an attached Text node", () => {
    const { doc, handler } = setup();
    const text = doc.createTextNode("hello");
    doc.body?.append(text);
    handler.mockClear();

    text.textContent = "world";

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("setText");
    if (rec.type === "setText") {
      expect(rec.node).toBe(text);
      expect(rec.value).toBe("world");
    }
  });

  it("does not fire on detached Text nodes", () => {
    const { handler } = setup();
    const text = new Text("hi");
    text.textContent = "bye";
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Plain Node (non-Element) mutations
// ---------------------------------------------------------------------------

describe("plain Node mutations", () => {
  it("emits insert when a plain node is appended to an attached element", () => {
    const { doc, handler } = setup();
    const plain = new Node(NodeType.COMMENT, "#comment");
    handler.mockClear();

    doc.body?.append(plain);

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("insert");
    if (rec.type === "insert") {
      expect(rec.child).toBe(plain);
    }
  });

  it("emits remove when a plain node is removed", () => {
    const { doc, handler } = setup();
    const plain = new Node(NodeType.COMMENT, "#comment");
    doc.body?.append(plain);
    handler.mockClear();

    plain.remove();

    expect(handler).toHaveBeenCalledOnce();
    const rec = lastRecord(handler);
    expect(rec.type).toBe("remove");
    if (rec.type === "remove") {
      expect(rec.child).toBe(plain);
    }
  });
});
