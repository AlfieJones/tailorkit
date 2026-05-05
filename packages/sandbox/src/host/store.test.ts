import { describe, expect, it, vi } from "vitest";
import type { RemoteNode } from "../protocol.js";
import { createRemoteUiStore } from "./store.js";

const tree = {
  children: [
    {
      children: [{ id: "text", kind: "text", text: "Save" }],
      events: [{ event: "click" }],
      id: "button",
      kind: "element",
      props: { disabled: false },
      type: "button",
    },
  ],
  id: "root",
  kind: "fragment",
} satisfies RemoteNode;

describe("createRemoteUiStore", () => {
  it("stores snapshots and renders through a framework-neutral renderer", () => {
    const store = createRemoteUiStore();

    store.handleWorkerMessage({
      data: { revision: 1, tree },
      type: "snapshot",
    });

    expect(
      store.render({
        renderElement(node, children) {
          return `${node.type}[${children.join("")}]`;
        },
        renderFragment(_node, children) {
          return children.join("");
        },
        renderText(text) {
          return text;
        },
      }),
    ).toBe("button[Save]");
  });

  it("applies patch batches without replacing the entire remote tree over the wire", () => {
    const store = createRemoteUiStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setSnapshot(tree, 1);

    store.handleWorkerMessage({
      data: {
        patches: [
          { nodeId: "text", op: "setText", text: "Saved" },
          { name: "disabled", nodeId: "button", op: "setProp", value: true },
          { events: [], nodeId: "button", op: "setEvents" },
        ],
        revision: 2,
      },
      type: "patches",
    });

    expect(store.getRevision()).toBe(2);
    expect(store.getSnapshot()).toMatchObject({
      children: [
        {
          events: [],
          props: { disabled: true },
          children: [{ text: "Saved" }],
        },
      ],
    });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("can insert and remove nodes by id", () => {
    const store = createRemoteUiStore();
    store.setSnapshot(tree, 1);

    store.applyPatches([
      {
        node: { id: "suffix", kind: "text", text: "!" },
        op: "insert",
        parentId: "button",
      },
      {
        nodeId: "text",
        op: "remove",
      },
    ]);

    expect(store.getSnapshot()).toMatchObject({
      children: [
        {
          children: [{ id: "suffix", text: "!" }],
        },
      ],
    });
  });
});
