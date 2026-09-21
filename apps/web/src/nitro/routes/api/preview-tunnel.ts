import { randomUUID } from "node:crypto";
import { hashSecret } from "@tailorkit/api-utils/hashing";
import { db } from "@tailorkit/db";
import { env } from "@tailorkit/env/server";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";
import { defineWebSocketHandler } from "nitro/h3";
import { publishPreviewAssetResponse, subscribePreviewTunnel } from "../../../preview-tunnel-relay";

const cleanups = new WeakMap<object, () => void>();

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url);
    return {
      context: { sessionId: url.searchParams.get("session"), token: url.searchParams.get("token") },
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
    heartbeat();
    const timer = setInterval(heartbeat, 20_000);
    const unsubscribe = await subscribePreviewTunnel(session.id, connectionId, (request) =>
      peer.send(JSON.stringify(request)),
    );
    cleanups.set(peer, () => {
      clearInterval(timer);
      unsubscribe();
    });
  },
  async message(_peer, message) {
    try {
      const response = JSON.parse(message.text()) as Parameters<
        typeof publishPreviewAssetResponse
      >[0];
      if (response.type === "response") {
        await publishPreviewAssetResponse(response);
      }
    } catch {
      /* ignore invalid peer messages */
    }
  },
  close(peer) {
    cleanups.get(peer)?.();
    cleanups.delete(peer);
  },
});
