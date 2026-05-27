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
      const button = document.createElement("tailorkit-button");
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
                callbacks: [],
                id: "n:2",
                kind: "element",
                props: { "data-kind": "primary" },
                type: "tailorkit-button",
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

  it("reports an error when the app metadata declares an unsupported Preact version", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appUrl = `data:text/javascript,${encodeURIComponent(`
      export default {
        $meta: {
          preactVersion: "9.0.0"
        },
        screens: {}
      };
    `)}`;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appUrl,
      },
      type: "init",
    });

    await vi.waitFor(() => {
      expect(messages).toContainEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            message: expect.stringContaining(
              "TailorKit requires app Preact 10.0.0 or newer, but found 9.0.0.",
            ),
          }),
          type: "error",
        }),
      );
    });
  });

  it("supports app bundles compiled against preact/jsx-runtime", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appUrl = `data:text/javascript,${encodeURIComponent(`
      import { jsx as _jsx } from "preact/jsx-runtime";
      export default function App() {
        return _jsx("div", { children: "Rendered from jsx runtime" });
      }
    `)}`;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appUrl,
      },
      type: "init",
    });

    await vi.waitFor(() => {
      expect(messages).toContainEqual({
        data: {
          revision: 1,
          tree: {
            children: [
              {
                children: [{ id: "n:1", kind: "text", text: "Rendered from jsx runtime" }],
                callbacks: [],
                id: "n:2",
                kind: "element",
                props: {},
                type: "div",
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

  it("renders the first implemented screen from the mounted match chain", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appUrl = `data:text/javascript,${encodeURIComponent(`
      function UsersScreen({ context, screen }) {
        return screen + ":" + context.count;
      }

      export default {
        $meta: {
          preactVersion: "10.0.0"
        },
        screens: {
          "/users": {
            component: UsersScreen
          }
        }
      };
    `)}`;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appUrl,
        props: {
          matches: [
            { context: { userId: "user_1" }, isLoading: false, screen: "/users/detail" },
            { context: { count: 3 }, isLoading: false, screen: "/users" },
          ],
        },
      },
      type: "init",
    });

    await vi.waitFor(() => {
      expect(messages).toContainEqual({
        data: {
          revision: 1,
          tree: {
            children: [{ id: "n:1", kind: "text", text: "/users:3" }],
            id: "n:2",
            kind: "fragment",
          },
        },
        type: "snapshot",
      });
    });
  });

  it("serializes numeric JSX children as text nodes", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appUrl = `data:text/javascript,${encodeURIComponent(`
      import { jsxs as _jsxs } from "preact/jsx-runtime";
      export default function App() {
        return _jsxs("div", { children: ["Count: ", 4] });
      }
    `)}`;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appUrl,
      },
      type: "init",
    });

    await vi.waitFor(() => {
      expect(messages).toContainEqual({
        data: {
          revision: 1,
          tree: {
            children: [
              {
                children: [
                  { id: "n:1", kind: "text", text: "Count: " },
                  { id: "n:2", kind: "text", text: "4" },
                ],
                callbacks: [],
                id: "n:3",
                kind: "element",
                props: {},
                type: "div",
              },
            ],
            id: "n:4",
            kind: "fragment",
          },
        },
        type: "snapshot",
      });
    });
  });
});
