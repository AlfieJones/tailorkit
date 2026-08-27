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
    const appSource = `
      const button = document.createElement("tailorkit-button");
      button.setAttribute("data-kind", "primary");
      button.appendChild(document.createTextNode("Save"));
      document.body.firstChild.appendChild(button);
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
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
    const appSource = `
      export default {
        $meta: {
          preactVersion: "9.0.0"
        },
        screens: {}
      };
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
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
    const appSource = `
      import { jsx as _jsx } from "preact/jsx-runtime";
      export default function App() {
        return _jsx("div", { children: "Rendered from jsx runtime" });
      }
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
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

  it("falls back through the screen hierarchy with the nested context", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appSource = `
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
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
        props: {
          screen: {
            context: { count: 3, userId: "user_1" },
            path: "/users/detail",
            status: "ready",
          },
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

  it("passes loading state to the matched app screen", async () => {
    vi.stubGlobal("self", {
      addEventListener(type: string, handler: (event: MessageEvent<unknown>) => void) {
        listeners.push({ handler, type });
      },
      postMessage(message: unknown) {
        messages.push(message);
      },
    });
    const appSource = `
      function UsersScreen({ status }) {
        return status;
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
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
        props: {
          screen: { path: "/users/detail", status: "loading" },
        },
      },
      type: "init",
    });

    await vi.waitFor(() => {
      expect(messages).toContainEqual({
        data: {
          revision: 1,
          tree: {
            children: [{ id: "n:1", kind: "text", text: "loading" }],
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
    const appSource = `
      import { jsxs as _jsxs } from "preact/jsx-runtime";
      export default function App() {
        return _jsxs("div", { children: ["Count: ", 4] });
      }
    `;

    await import("./worker.js");
    emitWorkerMessage({
      data: {
        appSource,
        appUrl: "https://assets.test/app.js",
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
