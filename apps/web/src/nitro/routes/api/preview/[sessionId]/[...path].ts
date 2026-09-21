import { db } from "@tailorkit/db";
import { verifyPreviewViewerToken } from "@tailorkit/api-platform/preview-token";
import { defineHandler } from "nitro/h3";
import { requestPreviewAsset } from "../../../../../preview-tunnel-relay";

export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const sessionId = event.context.params?.sessionId;
  const path = event.context.params?.path ?? "client.js";
  const token = url.searchParams.get("token");
  if (!sessionId || !token || !verifyPreviewViewerToken(sessionId, token)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const session = await db.query.previewSession.findFirst({
    where: { id: sessionId, status: "active" },
  });
  if (!session || session.expiresAt <= new Date()) {
    return new Response("Preview unavailable", { status: 404 });
  }
  const result = await requestPreviewAsset(
    sessionId,
    `/${path}`,
    event.req.method === "HEAD" ? "HEAD" : "GET",
  );
  if (!result) {
    return new Response("Preview CLI is offline", { status: 503 });
  }
  return new Response(event.req.method === "HEAD" ? null : Buffer.from(result.body, "base64"), {
    status: result.status,
    headers: result.headers,
  });
});
