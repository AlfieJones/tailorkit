import { ORPCError } from "@orpc/server";
import { hashSecret } from "@tailorkit/api-utils/hashing";
import { getBaseUrl, env } from "@tailorkit/env/server";
import { createPreviewTunnelPresence, getKV } from "@tailorkit/kv";
import { db } from "@tailorkit/db";
import { previewSession } from "@tailorkit/db/schema/preview-session";
import { randomBytes } from "node:crypto";
import z from "zod";
import { createPreviewViewerToken } from "../preview-token";
import { o, protectedRouter } from "../procedures";

const previewSessionLifetimeMs = 8 * 60 * 60 * 1000;

function hash(value: string): string {
  if (!env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is required for preview credentials.");
  }
  return hashSecret(value, env.AUTH_SECRET);
}

function createSecret(): string {
  return randomBytes(32).toString("base64url");
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
      }),
    }),
  )
  .handler(async ({ context, input }) => {
    const now = new Date();
    const token = await db.query.cliToken.findFirst({
      where: {
        projectId: context.project.id,
        tokenHash: hash(input.body.deployToken),
      },
    });
    if (!token || token.revokedAt || token.expiresAt <= now) {
      throw new ORPCError("UNAUTHORIZED", { message: "Invalid CLI deploy token." });
    }

    const previewApp = await db.query.app.findFirst({
      where: {
        projectId: context.project.id,
        publicId: input.body.appId,
        scopeId: token.scopeId,
      },
    });
    if (!previewApp) {
      throw new ORPCError("NOT_FOUND", { message: "App not found for this host scope." });
    }

    const tunnelToken = createSecret();
    const expiresAt = new Date(now.getTime() + previewSessionLifetimeMs);
    const [session] = await db
      .insert(previewSession)
      .values({
        appId: previewApp.id,
        cliTokenId: token.id,
        expiresAt,
        projectId: context.project.id,
        scopeId: token.scopeId,
        tunnelTokenHash: hash(tunnelToken),
      })
      .returning({ id: previewSession.id });
    if (!session) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create preview." });
    }

    const baseUrl = getBaseUrl().replace(/^http/u, "ws");
    const tunnelUrl = new URL("/api/preview-tunnel", baseUrl);
    tunnelUrl.searchParams.set("session", session.id);
    tunnelUrl.searchParams.set("token", tunnelToken);

    return { body: { expiresAt, sessionId: session.id, tunnelToken, tunnelUrl: tunnelUrl.href } };
  });

const resolvePreview = protectedRouter
  .route({ path: "/:sessionId", method: "GET" })
  .input(
    z.object({
      params: z.object({ sessionId: z.uuid() }),
      query: z.object({ scopeId: z.string().min(1) }),
    }),
  )
  .output(
    z.object({
      body: z.object({
        appId: z.string(),
        clientPath: z.url(),
        sessionId: z.string(),
        status: z.enum(["connected", "offline"]),
      }),
    }),
  )
  .handler(async ({ context, input }) => {
    const session = await db.query.previewSession.findFirst({
      where: {
        id: input.params.sessionId,
        projectId: context.project.id,
        scopeId: input.query.scopeId,
        status: "active",
      },
      with: { app: true },
    });
    if (!session || !session.app || session.expiresAt <= new Date()) {
      throw new ORPCError("NOT_FOUND", { message: "Preview session is unavailable." });
    }

    const assetUrl = new URL(`/api/preview/${session.id}/client.js`, getBaseUrl());
    assetUrl.searchParams.set("token", createPreviewViewerToken(session.id));
    const kv = getKV();
    const connected = kv ? await createPreviewTunnelPresence(kv).get(session.id) : null;
    return {
      body: {
        appId: session.app.publicId,
        clientPath: assetUrl.href,
        sessionId: session.id,
        status: connected ? "connected" : "offline",
      },
    };
  });

export const previewRouter = o
  .prefix("/preview")
  .router({ start: startPreview, resolve: resolvePreview });
