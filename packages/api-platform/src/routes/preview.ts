import { ORPCError } from "@orpc/server";
import { hashSecret } from "@tailorkit/api-utils/hashing";
import { getBaseUrl, env } from "@tailorkit/env/server";
import { getKV } from "@tailorkit/kv";
import { db } from "@tailorkit/db";
import { previewSession } from "@tailorkit/db/schema/preview-session";
import { project } from "@tailorkit/db/schema/project";
import { and, count, eq, lt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import z from "zod";
import { createPreviewBuildStore } from "../preview-build-store";
import { o, protectedRouter } from "../procedures";
import { previewGrantRoutes } from "./preview-grants";

const previewSessionLifetimeMs = 8 * 60 * 60 * 1000;
const maxActivePreviewsPerScope = 5;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function hash(value: string): string {
  if (!env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required for preview credentials.");
  }
  return hashSecret(value, env.AUTH_SECRET);
}

function createSecret(): string {
  return randomBytes(32).toString("base64url");
}

async function getValidCliToken(projectId: string, deployToken: string) {
  const token = await db.query.cliToken.findFirst({
    where: {
      projectId,
      tokenHash: hash(deployToken),
    },
  });
  if (!token || token.revokedAt || token.expiresAt <= new Date()) {
    throw new ORPCError("UNAUTHORIZED", { message: "Invalid CLI deploy token." });
  }
  return token;
}

const startPreview = protectedRouter
  .route({ path: "/start", method: "POST" })
  .input(z.object({ body: z.object({ appId: z.string().min(1), deployToken: z.string().min(1) }) }))
  .output(
    z.object({
      body: z.object({
        expiresAt: z.date(),
        sessionId: z.string(),
        tunnelToken: z.string(),
        tunnelUrl: z.url(),
        shareId: z.string(),
      }),
    }),
  )
  .handler(async ({ context, input }) => {
    if (!getKV()) {
      throw new ORPCError("SERVICE_UNAVAILABLE", {
        message: "Preview storage is unavailable: configure KV.",
      });
    }
    const now = new Date();
    const token = await getValidCliToken(context.project.id, input.body.deployToken);

    const previewApp = await db.query.app.findFirst({
      where: {
        projectId: context.project.id,
        scopeId: token.scopeId,
        ...(uuidPattern.test(input.body.appId)
          ? { id: input.body.appId }
          : { publicId: input.body.appId }),
      },
    });
    if (!previewApp) {
      throw new ORPCError("NOT_FOUND", { message: "App not found for this host scope." });
    }

    const tunnelToken = createSecret();
    const shareId = createSecret();
    const expiresAt = new Date(now.getTime() + previewSessionLifetimeMs);
    const session = await db
      .transaction(async (tx) => {
        // Serialize starts in this project so concurrent app starts cannot exceed the scope cap.
        await tx
          .select({ id: project.id })
          .from(project)
          .where(eq(project.id, context.project.id))
          .for("update");
        await tx
          .update(previewSession)
          .set({ endedAt: now, status: "ended" })
          .where(
            and(
              eq(previewSession.projectId, context.project.id),
              eq(previewSession.scopeId, token.scopeId),
              eq(previewSession.status, "active"),
              lt(previewSession.expiresAt, now),
            ),
          );
        const active = await tx.query.previewSession.findFirst({
          where: {
            appId: previewApp.id,
            status: "active",
          },
        });
        if (active) {
          throw new ORPCError("CONFLICT", {
            message: "An active preview already exists for this app.",
          });
        }
        const [scopeCount] = await tx
          .select({ total: count() })
          .from(previewSession)
          .where(
            and(
              eq(previewSession.projectId, context.project.id),
              eq(previewSession.scopeId, token.scopeId),
              eq(previewSession.status, "active"),
            ),
          );
        if ((scopeCount?.total ?? 0) >= maxActivePreviewsPerScope) {
          throw new ORPCError("CONFLICT", {
            message: `This scope already has ${maxActivePreviewsPerScope} active previews.`,
          });
        }
        const [created] = await tx
          .insert(previewSession)
          .values({
            appId: previewApp.id,
            cliTokenId: token.id,
            expiresAt,
            projectId: context.project.id,
            scopeId: token.scopeId,
            shareId,
            tunnelTokenHash: hash(tunnelToken),
          })
          .returning({ id: previewSession.id });
        return created;
      })
      .catch((error: unknown) => {
        if (error instanceof ORPCError) {
          throw error;
        }
        const candidate =
          error && typeof error === "object" && "cause" in error ? error.cause : error;
        if (
          candidate &&
          typeof candidate === "object" &&
          "code" in candidate &&
          candidate.code === "23505"
        ) {
          throw new ORPCError("CONFLICT", {
            message: "An active preview already exists for this app.",
          });
        }
        throw error;
      });
    if (!session) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create preview." });
    }

    const baseUrl = getBaseUrl().replace(/^http/u, "ws");
    const tunnelUrl = new URL("/api/platform/preview/ws", baseUrl);
    tunnelUrl.searchParams.set("session", session.id);
    return {
      body: { expiresAt, sessionId: session.id, shareId, tunnelToken, tunnelUrl: tunnelUrl.href },
    };
  });

const stopPreview = protectedRouter
  .route({ path: "/:sessionId/stop", method: "POST" })
  .input(
    z.object({
      body: z.object({ deployToken: z.string().min(1) }),
      params: z.object({ sessionId: z.uuid() }),
    }),
  )
  .output(z.object({ body: z.object({}) }))
  .handler(async ({ context, input }) => {
    const token = await getValidCliToken(context.project.id, input.body.deployToken);

    const [endedSession] = await db
      .update(previewSession)
      .set({ endedAt: new Date(), status: "ended" })
      .where(
        and(
          eq(previewSession.id, input.params.sessionId),
          eq(previewSession.projectId, context.project.id),
          eq(previewSession.cliTokenId, token.id),
          eq(previewSession.status, "active"),
        ),
      )
      .returning({ id: previewSession.id });
    if (!endedSession) {
      throw new ORPCError("NOT_FOUND", { message: "Preview session is unavailable." });
    }
    const kv = getKV();
    if (kv) {
      await createPreviewBuildStore(kv).end(endedSession.id);
    }
    return { body: {} };
  });

export const previewRouter = o
  .prefix("/preview")
  .router({ start: startPreview, stop: stopPreview, ...previewGrantRoutes });
