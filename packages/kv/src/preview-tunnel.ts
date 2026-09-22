import type { KV } from "./types.js";

export const previewTunnelHeartbeatSeconds = 20;
export const previewTunnelLeaseSeconds = 75;
const keyPrefix = "preview-tunnel:connection:";

export interface PreviewTunnelConnection {
  connectionId: string;
  revision: number;
}

function assertSessionId(sessionId: string): void {
  if (!/^[a-zA-Z0-9_-]{1,128}$/u.test(sessionId)) {
    throw new TypeError("Preview tunnel session id must be an opaque identifier.");
  }
}
function assertConnection(connection: PreviewTunnelConnection): void {
  if (!/^[a-zA-Z0-9_-]{1,128}$/u.test(connection.connectionId)) {
    throw new TypeError("Preview tunnel connection id must be an opaque identifier.");
  }
  if (!Number.isSafeInteger(connection.revision) || connection.revision < 0) {
    throw new TypeError("Preview tunnel revision must be a non-negative integer.");
  }
}

/** Stores a renewable CLI presence lease. Socket closes are not session ends. */
export function createPreviewTunnelPresence(kv: KV) {
  return {
    async heartbeat(sessionId: string, connection: PreviewTunnelConnection): Promise<void> {
      assertSessionId(sessionId);
      assertConnection(connection);
      await kv.set(`${keyPrefix}${sessionId}`, JSON.stringify(connection), {
        ttl: previewTunnelLeaseSeconds,
      });
    },
    async get(sessionId: string): Promise<PreviewTunnelConnection | null> {
      assertSessionId(sessionId);
      const raw = await kv.get(`${keyPrefix}${sessionId}`);
      if (!raw) {
        return null;
      }
      try {
        const value = JSON.parse(raw) as Partial<PreviewTunnelConnection>;
        if (
          typeof value.connectionId !== "string" ||
          typeof value.revision !== "number" ||
          !Number.isSafeInteger(value.revision) ||
          value.revision < 0
        ) {
          return null;
        }
        assertConnection({ connectionId: value.connectionId, revision: value.revision });
        return { connectionId: value.connectionId, revision: value.revision };
      } catch {
        return null;
      }
    },
  };
}
