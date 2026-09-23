import { db } from "@tailorkit/db";
import { previewSession } from "@tailorkit/db/schema/preview-session";
import type { KV } from "@tailorkit/kv";
import { createPreviewPresence } from "@tailorkit/kv";
import { and, eq } from "drizzle-orm";
import { createPreviewBuildStore } from "./preview-build-store";

const everKey = (sessionId: string) => `preview:developer-seen:${sessionId}`;

export async function recordPreviewHeartbeat(kv: KV, sessionId: string): Promise<void> {
  await createPreviewPresence(kv).heartbeat(sessionId, {
    connectionId: sessionId,
    revision: 0,
  });
  await kv.set(everKey(sessionId), "1", { ttl: 8 * 60 * 60 });
}

/** A developer has 75 seconds from the last heartbeat to reconnect. */
export async function ensurePreviewDeveloperGrace(kv: KV, sessionId: string): Promise<boolean> {
  const everConnected = await kv.get(everKey(sessionId));
  if (!everConnected || (await createPreviewPresence(kv).get(sessionId))) {
    return true;
  }
  await db
    .update(previewSession)
    .set({ status: "ended", endedAt: new Date() })
    .where(and(eq(previewSession.id, sessionId), eq(previewSession.status, "active")));
  await createPreviewBuildStore(kv).end(sessionId);
  return false;
}
