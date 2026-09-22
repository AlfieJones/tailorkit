import { randomUUID } from "node:crypto";
import { onError } from "@orpc/server";
import { experimental_RPCHandler as RPCHandler } from "@orpc/server/crossws";
import { hashSecret } from "@tailorkit/api-utils/hashing";
import { db } from "@tailorkit/db";
import { env } from "@tailorkit/env/server";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";
import type { Unsubscribe } from "@tailorkit/kv";
import { defineWebSocketHandler } from "nitro/h3";
import { previewTunnelRouter } from "@tailorkit/api-platform/preview-tunnel";
import type { PreviewTunnelContext } from "@tailorkit/api-platform/preview-tunnel";

const cleanups = new WeakMap<object, Unsubscribe>();
const contexts = new WeakMap<object, PreviewTunnelContext>();
const rpcHandler = new RPCHandler(previewTunnelRouter, {
  interceptors: [
    onError((error) => {
      console.error("Preview tunnel RPC failed", error);
    }),
  ],
});

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url);
    const token = request.headers
      .get("sec-websocket-protocol")
      ?.split(",")
      .map((protocol) => protocol.trim())
      .find((protocol) => /^[A-Za-z0-9_-]{43}$/u.test(protocol));
    return {
      context: { sessionId: url.searchParams.get("session"), token },
      protocol: token,
    };
  },
  async open(peer) {
    const context = peer.context as { sessionId?: string; token?: string };
    if (!context.sessionId || !context.token || !env.AUTH_SECRET) {
      peer.close();
      return;
    }
    const session = await db.query.previewSession.findFirst({
      where: {
        id: context.sessionId,
        status: "active",
        tunnelTokenHash: hashSecret(context.token, env.AUTH_SECRET),
      },
    });
    const kv = getKV();
    if (!session || session.expiresAt <= new Date() || !kv) {
      peer.close();
      return;
    }
    const connectionId = randomUUID();
    const presence = createPreviewTunnelPresence(kv);
    const heartbeat = () => void presence.heartbeat(session.id, { connectionId, revision: 0 });
    let timer: ReturnType<typeof setInterval> | undefined;
    const activate = () => {
      if (timer) {
        return;
      }
      heartbeat();
      timer = setInterval(heartbeat, 20_000);
    };
    contexts.set(peer, { activate, connectionId, sessionId: session.id });
    cleanups.set(peer, () => {
      if (timer) {
        clearInterval(timer);
      }
      return Promise.resolve();
    });
  },
  message(peer, message) {
    const context = contexts.get(peer);
    if (!context) {
      peer.close();
      return;
    }
    return rpcHandler.message(peer, message, {
      context,
    });
  },
  close(peer) {
    rpcHandler.close(peer);
    void cleanups
      .get(peer)?.()
      .catch(() => {
        // WebSocket close hooks cannot await cleanup, but must consume failures.
      });
    cleanups.delete(peer);
    contexts.delete(peer);
  },
});
