import type { KV, Unsubscribe } from "./types.js";

export const previewTunnelHeartbeatSeconds = 20;
export const previewTunnelLeaseSeconds = 75;
const keyPrefix = "preview-tunnel:connection:";
const channelPrefix = "preview-tunnel:connection-events:";

export interface PreviewTunnelConnection {
  connectionId: string;
  revision: number;
}

function connectionKey(sessionId: string): string {
  return `${keyPrefix}${sessionId}`;
}

function connectionChannel(sessionId: string): string {
  return `${channelPrefix}${sessionId}`;
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

function parseConnection(raw: string): PreviewTunnelConnection | null {
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
}

/** Stores a renewable CLI presence lease. Socket closes are not session ends. */
export function createPreviewTunnelPresence(kv: KV) {
  return {
    async heartbeat(sessionId: string, connection: PreviewTunnelConnection): Promise<void> {
      assertSessionId(sessionId);
      assertConnection(connection);
      await kv.set(connectionKey(sessionId), JSON.stringify(connection), {
        ttl: previewTunnelLeaseSeconds,
      });
      // Pub/sub wakes already-connected tunnel handlers immediately. The lease
      // above remains the source of truth when a subscriber reconnects late or
      // misses a transient Redis message.
      try {
        await kv.publish(connectionChannel(sessionId), JSON.stringify(connection));
      } catch {
        // The lease is authoritative; pub/sub only reduces update latency.
      }
    },
    async get(sessionId: string): Promise<PreviewTunnelConnection | null> {
      assertSessionId(sessionId);
      const raw = await kv.get(connectionKey(sessionId));
      if (!raw) {
        return null;
      }
      return parseConnection(raw);
    },
    /**
     * Subscribes to connection changes for an active tunnel handler. This is
     * best effort; callers must call `get` after subscribing to close the race
     * between loading the lease and opening their Redis subscription.
     */
    subscribe(
      sessionId: string,
      handler: (connection: PreviewTunnelConnection) => void,
    ): Promise<Unsubscribe> {
      assertSessionId(sessionId);
      return kv.subscribe(connectionChannel(sessionId), (message) => {
        const connection = parseConnection(message);
        if (connection) {
          handler(connection);
        }
      });
    },
  };
}
