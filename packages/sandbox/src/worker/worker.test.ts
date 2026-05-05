import { afterEach, describe, expect, it, vi } from "vitest";

interface ListenerRecord {
  handler: (event: MessageEvent<unknown>) => void;
  type: string;
}

const listeners: ListenerRecord[] = [];
const messages: unknown[] = [];

function emitWorkerMessage(data: unknown): void {
  for (const listener of listeners) {
    if (listener.type === "message") {
      listener.handler(new MessageEvent("message", { data }));
    }
  }
}

describe("worker runtime", () => {
  afterEach(() => {
    listeners.length = 0;
    messages.length = 0;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("imports the app bundle from init and snapshots the rendered Preact tree", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appUrl = `data:text/javascript,${encodeURIComponent(`
      const button = document.createElement("button");
      button.setAttribute("data-kind", "primary");
      button.appendChild(document.createTextNode("Save"));
      document.body.firstChild.appendChild(button);
    `)}`;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appUrl,
      },
      type: "init",
    });

    expect(messages).toContainEqual({ type: "ready" });
    await vi.waitFor(() => {
      expect(messages).toContainEqual({
        data: {
          revision: 1,
          tree: {
            children: [
              {
                children: [{ id: "n:1", kind: "text", text: "Save" }],
                events: [],
                id: "n:2",
                kind: "element",
                props: { "data-kind": "primary" },
                type: "button",
              },
            ],
            id: "n:3",
            kind: "fragment",
          },
        },
        type: "snapshot",
      });
    });
  });
});
