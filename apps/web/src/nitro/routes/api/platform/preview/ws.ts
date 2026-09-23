import { experimental_RPCHandler as RPCHandler } from "@orpc/server/crossws";
import { authorizePreviewSocket } from "@tailorkit/api-platform/preview-ws-auth";
import { previewWebSocketRouter } from "@tailorkit/api-platform/preview-ws";
import type { PreviewWebSocketContext } from "@tailorkit/api-platform/preview-ws";
import { defineWebSocketHandler } from "nitro/h3";
import { z } from "zod";

const handler = new RPCHandler(previewWebSocketRouter);
const contexts = new WeakMap<object, PreviewWebSocketContext>();
const upgradeSchema = z.object({
  sessionId: z.uuid(),
  role: z.enum(["uploader", "viewer"]),
  token: z.string().min(1),
});

export default defineWebSocketHandler({
  upgrade(request) {
    const url = new URL(request.url);
    const token = request.headers.get("sec-websocket-protocol")?.split(",")[0]?.trim();
    return {
      context: {
        sessionId: url.searchParams.get("session"),
        role: url.searchParams.get("role"),
        token,
      },
      protocol: token,
    };
  },
  async open(peer) {
    const parsed = upgradeSchema.safeParse(peer.context);
    if (!parsed.success) {
      return peer.close();
    }
    const { sessionId, role, token } = parsed.data;
    const context = await authorizePreviewSocket(sessionId, token, role);
    if (!context) {
      return peer.close();
    }
    contexts.set(peer, context);
  },
  message(peer, message) {
    const context = contexts.get(peer);
    if (!context) {
      return peer.close();
    }
    const payload = message.rawData;
    let size = Infinity;
    if (typeof payload === "string") {
      size = Buffer.byteLength(payload);
    } else if (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload)) {
      size = payload.byteLength;
    }
    if (size > 512 * 1024) {
      return peer.close();
    }
    return handler.message(peer, message, { context });
  },
  close(peer) {
    handler.close(peer);
    contexts.delete(peer);
  },
});
