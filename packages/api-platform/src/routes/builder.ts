import { ORPCError } from "@orpc/server";
import { app, appDeployment, appDeploymentFile } from "@tailorkit/db/schema/apps";
import {
  appOrigin,
  appSourceRevision,
  builderConversation,
  builderRun,
} from "@tailorkit/db/schema/builder";
import { db } from "@tailorkit/db";
import { uploadToUrl } from "@tailorkit/storage";
import type { Storage } from "@tailorkit/storage";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { withAppAssetUrl } from "../asset-url";
import { createPublicId } from "../public-id";
import { o, protectedRouter, requireApp } from "../procedures";
import { buildAppCandidate, sha256 } from "../builder/build-app";
import { validateSourceFiles } from "../builder/app-template";

const uploadExpiry = 15 * 60;
const scopeInput = z.object({ scopeId: z.string().min(1).max(255), origin: z.url() });

function hexToBase64(hex: string): string {
  return Buffer.from(hex, "hex").toString("base64");
}

async function readLatestSource(appId: string, scopeId: string, storage: Storage) {
  const [revision] = await db
    .select()
    .from(appSourceRevision)
    .where(and(eq(appSourceRevision.appId, appId), eq(appSourceRevision.scopeId, scopeId)))
    .orderBy(desc(appSourceRevision.createdAt))
    .limit(1);
  if (!revision) {
    return null;
  }
  const signed = await storage.createDownloadUrl({ key: revision.objectKey, expiresInSeconds: 60 });
  const url = new URL(signed.url);
  if (url.protocol !== "https:") {
    throw new Error("Source download URL must use HTTPS.");
  }
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error("Could not restore the last saved source revision.");
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 2 * 1024 * 1024) {
    throw new Error("Saved source exceeds the size limit.");
  }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
  return validateSourceFiles(parsed as Record<string, string>);
}

export const builderRouter = {
  apps: protectedRouter
    .route({ path: "/apps", method: "GET" })
    .input(z.object({ query: scopeInput }))
    .output(
      z.object({
        body: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            currentDeployment: z.object({ id: z.string() }).nullable(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }) => {
      const rows = await db
        .select({ app, origin: appOrigin.origin })
        .from(appOrigin)
        .innerJoin(app, eq(appOrigin.appId, app.id))
        .where(
          and(
            eq(appOrigin.projectId, context.project.id),
            eq(appOrigin.scopeId, input.query.scopeId),
            eq(appOrigin.origin, input.query.origin),
          ),
        )
        .orderBy(desc(app.updatedAt));
      return {
        body: rows.map(({ app: item }) => ({
          id: item.publicId,
          name: item.name,
          description: item.description,
          currentDeployment: item.currentDeploymentId ? { id: item.currentDeploymentId } : null,
        })),
      };
    }),

  createApp: protectedRouter
    .route({ path: "/apps", method: "POST" })
    .input(
      z.object({
        body: scopeInput.extend({
          name: z.string().min(1).max(127),
          description: z.string().max(255).optional(),
        }),
      }),
    )
    .output(
      z.object({
        body: z.object({ id: z.string(), name: z.string(), description: z.string().nullable() }),
      }),
    )
    .handler(async ({ context, input }) => {
      const { name, description, scopeId, origin } = input.body;
      const created = await db.transaction(async (tx) => {
        const [createdApp] = await tx
          .insert(app)
          .values({
            publicId: createPublicId(),
            projectId: context.project.id,
            scopeId,
            name,
            description: description ?? null,
          })
          .returning();
        if (!createdApp) {
          throw new ORPCError("BAD_REQUEST", { message: "Could not create app." });
        }
        await tx.insert(appOrigin).values({
          projectId: context.project.id,
          appId: createdApp.id,
          scopeId,
          origin,
        });
        return createdApp;
      });
      return {
        body: { id: created.publicId, name: created.name, description: created.description },
      };
    }),

  run: protectedRouter
    .route({ path: "/runs", method: "POST" })
    .input(
      z.object({
        body: scopeInput.extend({
          appId: z.string(),
          prompt: z.string().trim().min(1).max(20_000),
          conversationId: z.string().uuid().optional(),
        }),
      }),
    )
    .output(
      z.object({
        body: z.object({
          conversationId: z.string().uuid(),
          messages: z.array(
            z.object({
              id: z.string(),
              role: z.enum(["user", "assistant"]),
              content: z.string(),
              createdAt: z.string(),
            }),
          ),
          candidate: z.object({
            app: z.object({ id: z.string(), name: z.string(), description: z.string().nullable() }),
            previewUrl: z.string(),
            sourceRevision: z.string(),
            deploymentId: z.string(),
            runId: z.string(),
          }),
          runId: z.string().uuid(),
        }),
      }),
    )
    .use(requireApp, ({ body: { appId, scopeId } }) => ({ appId, scopeId }))
    .handler(async ({ context, input }) => {
      const { app: currentApp } = context;
      const originRow = await db.query.appOrigin.findFirst({ where: { appId: currentApp.id } });
      if (
        !originRow ||
        originRow.scopeId !== input.body.scopeId ||
        originRow.origin !== input.body.origin
      ) {
        throw new ORPCError("NOT_FOUND", { message: "App not found in this host scope." });
      }
      const conversation = input.body.conversationId
        ? await db.query.builderConversation.findFirst({
            where: {
              id: input.body.conversationId,
              appId: currentApp.id,
              projectId: context.project.id,
              scopeId: input.body.scopeId,
            },
          })
        : await db.query.builderConversation.findFirst({
            where: {
              appId: currentApp.id,
              projectId: context.project.id,
              scopeId: input.body.scopeId,
            },
            orderBy: (table, { desc: descending }) => [descending(table.updatedAt)],
          });
      const [activeConversation] = conversation
        ? [conversation]
        : await db
            .insert(builderConversation)
            .values({
              projectId: context.project.id,
              appId: currentApp.id,
              scopeId: input.body.scopeId,
              title: input.body.prompt.slice(0, 120),
            })
            .returning();
      if (!activeConversation) {
        throw new ORPCError("BAD_REQUEST", { message: "Could not create conversation." });
      }
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: input.body.prompt,
        createdAt: new Date().toISOString(),
      };
      const oldMessages = activeConversation.messages ?? [];
      const [run] = await db
        .insert(builderRun)
        .values({
          projectId: context.project.id,
          appId: currentApp.id,
          conversationId: activeConversation.id,
          scopeId: input.body.scopeId,
          status: "running",
        })
        .returning();
      if (!run) {
        throw new ORPCError("BAD_REQUEST", { message: "Could not start builder run." });
      }
      await db
        .update(builderConversation)
        .set({ messages: [...oldMessages, userMessage], updatedAt: new Date() })
        .where(eq(builderConversation.id, activeConversation.id));

      try {
        const previousSource = await readLatestSource(
          currentApp.id,
          input.body.scopeId,
          context.storage,
        );
        const built = await buildAppCandidate({
          appName: currentApp.name,
          previousSource,
          prompt: input.body.prompt,
        });
        const deploymentId = crypto.randomUUID();
        const deploymentPublicId = createPublicId();
        const fileId = crypto.randomUUID();
        const bundleChecksum = sha256(built.clientBundle);
        const appBaseKey = `teams/${context.organization.publicId}/projects/${context.project.id}/apps/${currentApp.publicId}`;
        const bundleKey = `${appBaseKey}/deployments/${deploymentPublicId}/files/client.js`;
        const bundleUpload = await context.storage.createUploadUrl({
          checksumSha256: hexToBase64(bundleChecksum),
          contentType: "application/javascript",
          expiresInSeconds: uploadExpiry,
          key: bundleKey,
          metadata: { appDeploymentId: deploymentId, appId: currentApp.id, fileId },
        });
        await uploadToUrl({
          uploadUrl: bundleUpload.uploadUrl,
          body: built.clientBundle,
          headers: bundleUpload.headers,
          contentType: "application/javascript",
          maxBytes: 5 * 1024 * 1024,
        });
        const bundleHead = await context.storage.head({ key: bundleKey });
        if (
          bundleHead.contentLength !== built.clientBundle.byteLength ||
          bundleHead.contentType !== "application/javascript" ||
          bundleHead.checksumSha256 !== hexToBase64(bundleChecksum)
        ) {
          throw new Error("Candidate bundle verification failed.");
        }

        const revision = sha256(Buffer.from(`${run.id}\n${JSON.stringify(built.sourceFiles)}`));
        const sourceKey = `${appBaseKey}/sources/${revision}.json`;
        const sourceBody = Buffer.from(JSON.stringify(built.sourceFiles));
        const sourceUpload = await context.storage.createUploadUrl({
          key: sourceKey,
          checksumSha256: hexToBase64(sha256(sourceBody)),
          contentType: "application/json",
          expiresInSeconds: uploadExpiry,
        });
        await uploadToUrl({
          uploadUrl: sourceUpload.uploadUrl,
          body: sourceBody,
          headers: sourceUpload.headers,
          contentType: "application/json",
          maxBytes: 2 * 1024 * 1024,
        });
        const sourceHead = await context.storage.head({ key: sourceKey });
        if (
          sourceHead.contentLength !== sourceBody.byteLength ||
          sourceHead.checksumSha256 !== hexToBase64(sha256(sourceBody))
        ) {
          throw new Error("Source snapshot verification failed.");
        }

        const [deployment] = await db.transaction(async (tx) => {
          const [createdDeployment] = await tx
            .insert(appDeployment)
            .values({
              id: deploymentId,
              appId: currentApp.id,
              publicId: deploymentPublicId,
              status: "published",
            })
            .returning();
          if (!createdDeployment) {
            throw new Error("Could not create candidate deployment.");
          }
          await tx.insert(appDeploymentFile).values({
            id: fileId,
            appDeploymentId: deploymentId,
            objectKey: bundleKey,
            contentType: "application/javascript",
            encoding: "utf-8",
            contentLength: built.clientBundle.byteLength,
            checksum: bundleChecksum,
            status: "verified",
          });
          const [withEntry] = await tx
            .update(appDeployment)
            .set({ clientEntryFileId: fileId })
            .where(eq(appDeployment.id, deploymentId))
            .returning();
          if (!withEntry) {
            throw new Error("Could not attach candidate bundle.");
          }
          await tx.insert(appSourceRevision).values({
            projectId: context.project.id,
            appId: currentApp.id,
            conversationId: activeConversation.id,
            runId: run.id,
            scopeId: input.body.scopeId,
            revision,
            objectKey: sourceKey,
          });
          const assistantMessage = {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: built.assistantMessage,
            createdAt: new Date().toISOString(),
          };
          await tx
            .update(builderConversation)
            .set({
              messages: [...oldMessages, userMessage, assistantMessage],
              updatedAt: new Date(),
            })
            .where(eq(builderConversation.id, activeConversation.id));
          await tx
            .update(builderRun)
            .set({
              status: "preview_ready",
              candidateDeploymentId: deploymentId,
              updatedAt: new Date(),
            })
            .where(eq(builderRun.id, run.id));
          return [withEntry];
        });
        const appForPreview = { ...currentApp, currentDeployment: deployment };
        const candidateApp = withAppAssetUrl(
          appForPreview,
          context.organization.publicId,
          context.project.id,
        );
        const refreshedConversation = await db.query.builderConversation.findFirst({
          where: { id: activeConversation.id },
        });
        const assistantMessage = refreshedConversation?.messages.at(-1);
        if (!candidateApp.clientPath || !assistantMessage) {
          throw new Error("The preview URL or saved assistant message is unavailable.");
        }
        return {
          body: {
            conversationId: activeConversation.id,
            messages: [...oldMessages, userMessage, assistantMessage],
            candidate: {
              app: {
                id: currentApp.publicId,
                name: currentApp.name,
                description: currentApp.description,
              },
              previewUrl: candidateApp.clientPath,
              sourceRevision: revision,
              deploymentId,
              runId: run.id,
            },
            runId: run.id,
          },
        };
      } catch (error) {
        const detail =
          error instanceof Error ? error.message.slice(0, 2000) : "The app build failed.";
        const errorMessage = {
          id: crypto.randomUUID(),
          role: "assistant" as const,
          content: detail,
          createdAt: new Date().toISOString(),
        };
        await db
          .update(builderConversation)
          .set({ messages: [...oldMessages, userMessage, errorMessage], updatedAt: new Date() })
          .where(eq(builderConversation.id, activeConversation.id));
        await db
          .update(builderRun)
          .set({ status: "failed", error: detail, updatedAt: new Date() })
          .where(eq(builderRun.id, run.id));
        throw new ORPCError("BAD_REQUEST", { message: detail });
      }
    }),

  publish: protectedRouter
    .route({ path: "/runs/:runId/publish", method: "POST" })
    .input(z.object({ params: z.object({ runId: z.string().uuid() }), body: scopeInput }))
    .output(z.object({ body: z.object({ published: z.boolean() }) }))
    .handler(async ({ context, input }) => {
      const run = await db.query.builderRun.findFirst({
        where: {
          id: input.params.runId,
          projectId: context.project.id,
          scopeId: input.body.scopeId,
          status: "preview_ready",
        },
      });
      if (!run?.candidateDeploymentId) {
        throw new ORPCError("NOT_FOUND", { message: "Candidate not found." });
      }
      const owned = await db.query.appOrigin.findFirst({
        where: {
          appId: run.appId,
          projectId: context.project.id,
          scopeId: input.body.scopeId,
          origin: input.body.origin,
        },
      });
      if (!owned) {
        throw new ORPCError("NOT_FOUND", { message: "Candidate not found in this host scope." });
      }
      const candidate = await db.query.appDeployment.findFirst({
        where: { id: run.candidateDeploymentId, appId: run.appId, status: "published" },
      });
      if (!candidate) {
        throw new ORPCError("NOT_FOUND", { message: "Candidate deployment not found." });
      }
      await db.transaction(async (tx) => {
        await tx
          .update(app)
          .set({ currentDeploymentId: candidate.id })
          .where(
            and(
              eq(app.id, run.appId),
              eq(app.projectId, context.project.id),
              eq(app.scopeId, input.body.scopeId),
            ),
          );
        await tx
          .update(builderRun)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(builderRun.id, run.id));
      });
      return { body: { published: true } };
    }),
};

export const platformBuilderRouter = o.prefix("/builder").router(builderRouter);
