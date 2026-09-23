import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  message: vi.fn(),
  close: vi.fn(),
}));

vi.mock("@tailorkit/api-platform/preview-ws-auth", () => ({
  authorizePreviewSocket: mocks.authorize,
}));
vi.mock("@tailorkit/api-platform/preview-ws", () => ({ previewWebSocketRouter: {} }));
vi.mock("@orpc/server/crossws", () => ({
  experimental_RPCHandler: class {
    handlers = mocks;
    message(...args) {
      return this.handlers.message(...args);
    }
    close(...args) {
      return this.handlers.close(...args);
    }
  },
}));
vi.mock("nitro/h3", () => ({ defineWebSocketHandler: (handlers) => handlers }));

const { default: socket } = await import("../nitro/routes/api/platform/preview/ws.ts");
const context = { sessionId: "11111111-1111-4111-8111-111111111111", role: "uploader" };

beforeEach(() => {
  vi.clearAllMocks();
});

it("waits for authorization before handling an early message", async () => {
  let resolveAuthorization;
  mocks.authorize.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveAuthorization = resolve;
    }),
  );
  const peer = { context: { ...context, token: "token" }, close: vi.fn() };
  const message = { rawData: "{}" };

  const opening = socket.open(peer);
  const handling = socket.message(peer, message);
  expect(peer.close).not.toHaveBeenCalled();
  expect(mocks.message).not.toHaveBeenCalled();

  resolveAuthorization(context);
  await Promise.all([opening, handling]);
  expect(peer.close).not.toHaveBeenCalled();
  expect(mocks.message).toHaveBeenCalledWith(peer, message, { context });
});

it("closes an early message when authorization fails", async () => {
  let resolveAuthorization;
  mocks.authorize.mockReturnValueOnce(
    new Promise((resolve) => {
      resolveAuthorization = resolve;
    }),
  );
  const peer = { context: { ...context, token: "invalid" }, close: vi.fn() };

  const opening = socket.open(peer);
  const handling = socket.message(peer, { rawData: "{}" });
  resolveAuthorization(null);
  await Promise.all([opening, handling]);
  expect(peer.close).toHaveBeenCalled();
  expect(mocks.message).not.toHaveBeenCalled();
});
