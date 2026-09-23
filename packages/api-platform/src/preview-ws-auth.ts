import { hashSecret } from "@tailorkit/api-utils/hashing";
import { db } from "@tailorkit/db";
import { env } from "@tailorkit/env/server";
import { getKV } from "@tailorkit/kv";
import { verifyPreviewViewerToken } from "./preview-token";
import { ensurePreviewDeveloperGrace } from "./preview-lifecycle";
import type { PreviewWebSocketContext } from "./preview-ws";

export async function authorizePreviewSocket(
  sessionId: string,
  token: string,
  role: "uploader" | "viewer",
): Promise<PreviewWebSocketContext | null> {
  const kv = getKV();
  if (!kv || !env.AUTH_SECRET) {
    return null;
  }
  const session = await db.query.previewSession.findFirst({
    where: { id: sessionId, status: "active" },
    with: { cliToken: true },
  });
  if (
    !session ||
    session.expiresAt <= new Date() ||
    !(await ensurePreviewDeveloperGrace(kv, sessionId))
  ) {
    return null;
  }
  if (role === "viewer") {
    return verifyPreviewViewerToken(sessionId, token) ? { sessionId, role } : null;
  }
  if (!session.cliToken || session.cliToken.revokedAt || session.cliToken.expiresAt <= new Date()) {
    return null;
  }
  return session.tunnelTokenHash === hashSecret(token, env.AUTH_SECRET)
    ? { sessionId, role }
    : null;
}
