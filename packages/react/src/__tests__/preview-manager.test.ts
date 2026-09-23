/* oxlint-disable require-await -- transport mocks return the asynchronous client shape. */
import { createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { createPreviewManager } from "../preview-manager";
import type { PreviewEvent } from "@tailorkit/client-platform/preview";

const state = vi.hoisted(() => ({ events: [] as PreviewEvent[], batches: [] as PreviewEvent[][] }));
vi.mock("@tailorkit/client-platform/preview", () => ({
  createPreviewWebSocketClient: () => ({
    subscribe: async () =>
      (async function* subscribe() {
        yield* state.batches.shift() ?? state.events;
      })(),
  }),
}));

class FakeSocket extends EventTarget {
  static instances: FakeSocket[] = [];
  closed = false;
  constructor(_url: string, _protocol: string) {
    super();
    FakeSocket.instances.push(this);
  }
  close() {
    this.closed = true;
    this.dispatchEvent(new Event("close"));
  }
  open() {
    this.dispatchEvent(new Event("open"));
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeSocket.instances = [];
  state.events = [];
  state.batches = [];
});

it("keeps the last complete build through a corrupt transfer and recovers after reconnect", async () => {
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        sessionId: "session",
        websocketUrl: "wss://platform.test/preview",
        token: "token",
      }),
    })),
  );
  const buildEvents = (revision: number, source: string, chunk: string): PreviewEvent[] => {
    const bytes = Buffer.from(source);
    return [
      {
        type: "begin",
        buildId: `build-${revision}`,
        revision,
        manifest: {
          files: [
            {
              path: "client.js",
              contentType: "text/javascript",
              size: bytes.length,
              chunks: 1,
              sha256: createHash("sha256").update(bytes).digest("hex"),
            },
          ],
        },
      },
      {
        type: "chunk",
        revision,
        fileIndex: 0,
        chunkIndex: 0,
        base64: Buffer.from(chunk).toString("base64"),
      },
      { type: "complete", revision },
    ];
  };
  state.batches = [
    buildEvents(1, "original", "original"),
    buildEvents(2, "replacement", "corruption"),
    buildEvents(2, "replacement", "replacement"),
  ];
  const manager = createPreviewManager(new URL("https://host.test/api/tailorkit/"), vi.fn());
  const unsubscribe = manager.subscribe(
    {
      id: "app",
      preview: {
        sessionId: "session",
        expiresAt: "later",
        websocketUrl: "wss://platform.test/preview",
        token: "token",
      },
    },
    vi.fn(),
  );
  await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(1));
  FakeSocket.instances[0]?.open();
  await vi.waitFor(() =>
    expect(manager.getSnapshot("session")).toEqual({ revision: 1, source: "original" }),
  );
  FakeSocket.instances[0]?.close();
  await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(2), { timeout: 2500 });
  FakeSocket.instances[1]?.open();
  await vi.waitFor(() => expect(state.batches).toHaveLength(1));
  expect(manager.getSnapshot("session")).toEqual({ revision: 1, source: "original" });
  FakeSocket.instances[1]?.close();
  await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(3), { timeout: 2500 });
  FakeSocket.instances[2]?.open();
  await vi.waitFor(() =>
    expect(manager.getSnapshot("session")).toEqual({ revision: 2, source: "replacement" }),
  );
  unsubscribe();
  expect(FakeSocket.instances[2]?.closed).toBe(true);
});

it("shares one socket, applies only complete checksummed revisions, and closes on last unsubscribe", async () => {
  vi.stubGlobal("WebSocket", FakeSocket);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => ({
        sessionId: "session",
        websocketUrl: "wss://platform.test/preview",
        token: "token",
      }),
    })),
  );
  const source = "export default 1";
  const bytes = Buffer.from(source);
  state.events = [
    {
      type: "begin",
      buildId: "build",
      revision: 1,
      manifest: {
        files: [
          {
            path: "client.js",
            contentType: "text/javascript",
            size: bytes.length,
            chunks: 1,
            sha256: createHash("sha256").update(bytes).digest("hex"),
          },
        ],
      },
    },
    { type: "chunk", revision: 1, fileIndex: 0, chunkIndex: 0, base64: bytes.toString("base64") },
    { type: "complete", revision: 1 },
  ];
  const manager = createPreviewManager(new URL("https://host.test/api/tailorkit/"), vi.fn());
  const app = {
    id: "app",
    preview: {
      sessionId: "session",
      expiresAt: "later",
      websocketUrl: "wss://platform.test/preview",
      token: "token",
    },
  };
  const listener = vi.fn();
  const first = manager.subscribe(app, listener);
  const second = manager.subscribe(app, vi.fn());
  await vi.waitFor(() => expect(FakeSocket.instances).toHaveLength(1));
  FakeSocket.instances[0]?.open();
  await vi.waitFor(() => expect(manager.getSnapshot("session")).toEqual({ revision: 1, source }));
  first();
  expect(FakeSocket.instances[0]?.closed).toBe(false);
  second();
  expect(FakeSocket.instances[0]?.closed).toBe(true);
});
