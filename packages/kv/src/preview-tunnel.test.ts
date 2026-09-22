import { describe, expect, it, vi } from "vitest";
import { createPreviewTunnelPresence, previewTunnelLeaseSeconds } from "./preview-tunnel.js";
import type { KV } from "./types.js";

function createKV(values = new Map<string, string>()): KV {
  return {
    delete: vi.fn(),
    engine: {} as never,
    get: vi.fn((key: string) => Promise.resolve(values.get(key) ?? null)),
    getAndDelete: vi.fn(),
    increment: vi.fn(),
    set: vi.fn((key: string, value: string) => {
      values.set(key, value);
      return Promise.resolve();
    }),
    type: "redis",
  };
}
describe("preview tunnel presence", () => {
  it("uses a renewing TTL lease", async () => {
    const kv = createKV();
    const presence = createPreviewTunnelPresence(kv);
    await presence.heartbeat("session_123", { connectionId: "connection_123", revision: 4 });
    expect(kv.set).toHaveBeenCalledWith(
      "preview-tunnel:connection:session_123",
      JSON.stringify({ connectionId: "connection_123", revision: 4 }),
      { ttl: previewTunnelLeaseSeconds },
    );
  });
  it("treats an absent or malformed lease as offline", async () => {
    const presence = createPreviewTunnelPresence(
      createKV(new Map([["preview-tunnel:connection:broken", "not-json"]])),
    );
    await expect(presence.get("missing")).resolves.toBeNull();
    await expect(presence.get("broken")).resolves.toBeNull();
  });
});
