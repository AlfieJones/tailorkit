import { db } from "@tailorkit/db";
import { subscribePreviewEvents } from "@tailorkit/api-platform/preview-tunnel-relay";
import { verifyPreviewViewerToken } from "@tailorkit/api-platform/preview-token";
import { defineWebSocketHandler } from "nitro/h3";

const cleanups = new WeakMap<object, () => Promise<void>>();
const closed = new WeakSet<object>();

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url);
    const token = request.headers
      .get("sec-websocket-protocol")
      ?.split(",")
      .map((protocol) => protocol.trim())
      .find((protocol) => /^\d+\.[A-Za-z0-9_-]{43}$/u.test(protocol));
    return { context: { sessionId: url.searchParams.get("session"), token }, protocol: token };
  },
  async open(peer) {
    const { sessionId, token } = peer.context as { sessionId?: string; token?: string };
    if (!sessionId || !token || !verifyPreviewViewerToken(sessionId, token)) {
      peer.close();
      return;
    }
    const session = await db.query.previewSession.findFirst({
      where: { id: sessionId, status: "active" },
    });
    if (!session || session.expiresAt <= new Date()) {
      peer.close();
      return;
    }
    try {
      const unsubscribe = await subscribePreviewEvents(sessionId, (type) => {
        peer.send(JSON.stringify({ type }));
        if (type === "ended") {
          peer.close();
        }
      });
      if (closed.has(peer)) {
        await unsubscribe();
      } else {
        cleanups.set(peer, unsubscribe);
      }
    } catch {
      peer.close();
    }
  },
  close(peer) {
    closed.add(peer);
    void cleanups.get(peer)?.();
    cleanups.delete(peer);
  },
});
