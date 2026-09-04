import { ORPCError } from "@orpc/server";
import { db } from "@tailorkit/db";
import {
  app,
  appDeployment,
  AppDeploymentFile,
  appDeploymentFile,
} from "@tailorkit/db/schema/apps";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { paginatedOutput, paginationQuery } from "../pagination";
import { o, protectedRouter, requireApp } from "../procedures";
import { setSpanAttributes } from "@tailorkit/observability";
import { createPublicId } from "../public-id";
import { DeploymentWithAssetUrl, withAssetUrl } from "../asset-url";

const uploadUrlExpiresInSeconds = 15 * 60;

const createDeploymentAssetInput = AppDeploymentFile.pick({
  contentType: true,
  encoding: true,
}).extend({
  checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/iu)
    .transform((checksum) => checksum.toLowerCase()),
  contentLength: z
    .number()
    .int()
    .min(1)
    .max(1024 * 1024),
  objectKey: z.literal("client.js"),
});

const deploymentAssetUpload = z.object({
  file: AppDeploymentFile,
  headers: z.record(z.string(), z.string()).optional(),
  uploadUrl: z.url(),
});

const requireDeployment = o.middleware(
  async ({ next, context }, input: { deploymentId: string; scopeId: string }) => {
    setSpanAttributes({
      "tailorkit.middleware": "require_deployment",
      "tailorkit.package": "api-platform",
      "tailorkit.resource_type": "deployment",
    });

    const deploymentWithApp = await db.query.appDeployment.findFirst({
      where: {
        id: input.deploymentId,
      },
      with: {
        app: true,
      },
    });

    if (
      !deploymentWithApp ||
      !deploymentWithApp.app ||
      deploymentWithApp.app.projectId !== context.project.id ||
      deploymentWithApp.app.scopeId !== input.scopeId
    ) {
      throw new ORPCError("NOT_FOUND", { message: "Deployment not found." });
    }

    const { app: scopedApp, ...deployment } = deploymentWithApp;

    return next({ context: { ...context, app: scopedApp, deployment } });
  },
);

function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }

  return Buffer.from(bytes).toString("base64");
}

const listAppDeployments = protectedRouter
  .route({
    path: "/",
    method: "GET",
  })
  .input(
    z.object({
      query: paginationQuery.extend({ appId: z.string(), scopeId: z.string() }),
    }),
  )
  .output(paginatedOutput(DeploymentWithAssetUrl))
  .use(requireApp, ({ query: { appId, scopeId } }) => ({ appId, scopeId }))
  .handler(async ({ context, input }) => {
    const { page, pageSize } = input.query;
    const deployments = await db.query.appDeployment.findMany({
      where: {
        appId: context.app.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      limit: pageSize + 1,
      offset: (page - 1) * pageSize,
    });

    return {
      body: {
        items: deployments
          .slice(0, pageSize)
          .map((deployment) =>
            withAssetUrl(deployment, context.organization.publicId, context.project.id),
          ),
        pagination: {
          hasMore: deployments.length > pageSize,
          page,
          pageSize,
        },
      },
    };
  });

const getAppDeployment = protectedRouter
  .route({
    path: "/:deploymentId",
    method: "GET",
  })
  .input(
    z.object({
      params: z.object({ deploymentId: z.string() }),
      query: z.object({ scopeId: z.string() }),
    }),
  )
  .output(z.object({ body: DeploymentWithAssetUrl }))
  .use(requireDeployment, ({ params: { deploymentId }, query: { scopeId } }) => ({
    deploymentId,
    scopeId,
  }))
  .handler(({ context }) => ({
    body: withAssetUrl(context.deployment, context.organization.publicId, context.project.id),
  }));

const createAppDeployment = protectedRouter
  .route({
    path: "/",
    method: "POST",
  })
  .input(
    z.object({
      body: z.object({
        appId: z.string(),
        assets: z.tuple([createDeploymentAssetInput]),
        scopeId: z.string(),
      }),
    }),
  )
  .output(
    z.object({
      body: z.object({
        assets: z.tuple([deploymentAssetUpload]),
        deployment: DeploymentWithAssetUrl,
      }),
    }),
  )
  .use(requireApp, ({ body: { appId, scopeId } }) => ({ appId, scopeId }))
  .handler(async ({ context, input }) => {
    const [asset] = input.body.assets;
    const deploymentId = crypto.randomUUID();
    const fileId = crypto.randomUUID();
    const objectKey = `teams/${context.organization.publicId}/projects/${context.project.id}/apps/${context.app.id}/deployments/${deploymentId}/files/${asset.objectKey}`;
    const checksumSha256 = hexToBase64(asset.checksum);
    const uploadUrl = await context.storage.createUploadUrl({
      checksumSha256,
      contentType: asset.contentType,
      expiresInSeconds: uploadUrlExpiresInSeconds,
      key: objectKey,
      metadata: {
        appDeploymentId: deploymentId,
        appId: context.app.id,
        fileId,
      },
    });

    const created = await db.transaction(async (tx) => {
      const [deployment] = await tx
        .insert(appDeployment)
        .values({
          id: deploymentId,
          appId: context.app.id,
          publicId: createPublicId(),
          status: "uploading",
        })
        .returning();

      if (!deployment) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create deployment." });
      }

      const [file] = await tx
        .insert(appDeploymentFile)
        .values({
          id: fileId,
          appDeploymentId: deployment.id,
          checksum: asset.checksum,
          contentLength: asset.contentLength,
          contentType: asset.contentType,
          encoding: asset.encoding,
          objectKey,
        })
        .returning();

      if (!file) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create deployment asset." });
      }

      const [updatedDeployment] = await tx
        .update(appDeployment)
        .set({ clientEntryFileId: file.id })
        .where(eq(appDeployment.id, deployment.id))
        .returning();

      if (!updatedDeployment) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to update deployment asset." });
      }

      return { createdDeployment: updatedDeployment, createdFile: file };
    });
    const { createdDeployment, createdFile } = created;

    return {
      body: {
        assets: [
          {
            file: createdFile,
            headers: uploadUrl.headers,
            uploadUrl: uploadUrl.uploadUrl,
          },
        ],
        deployment: withAssetUrl(
          createdDeployment,
          context.organization.publicId,
          context.project.id,
        ),
      },
    };
  });

const publishAppDeployment = protectedRouter
  .route({
    path: "/:deploymentId",
    method: "POST",
  })
  .input(
    z.object({
      body: z.object({
        scopeId: z.string(),
        rollout: z.boolean().optional().default(true),
      }),
      params: z.object({ deploymentId: z.string() }),
    }),
  )
  .output(z.object({ body: DeploymentWithAssetUrl }))
  .use(requireDeployment, ({ body: { scopeId }, params: { deploymentId } }) => ({
    deploymentId,
    scopeId,
  }))
  .handler(async ({ context, input }) => {
    const { deployment } = context;
    const files = await db.query.appDeploymentFile.findMany({
      where: {
        appDeploymentId: deployment.id,
      },
    });

    if (files.length === 0) {
      throw new ORPCError("BAD_REQUEST", { message: "Deployment has no files to publish." });
    }

    await db
      .update(appDeployment)
      .set({ status: "verifying" })
      .where(eq(appDeployment.id, deployment.id));

    for (const file of files) {
      await db
        .update(appDeploymentFile)
        .set({ status: "verifying" })
        .where(eq(appDeploymentFile.id, file.id));

      try {
        const object = await context.storage.head({ key: file.objectKey });
        const contentLength = object.contentLength;

        if (contentLength !== file.contentLength) {
          throw new Error("Uploaded file content length does not match deployment record.");
        }

        if (object.contentType !== file.contentType) {
          throw new Error("Uploaded file content type does not match deployment record.");
        }

        if (!file.checksum || object.checksumSha256 !== hexToBase64(file.checksum)) {
          throw new Error("Uploaded file checksum does not match deployment record.");
        }

        await db
          .update(appDeploymentFile)
          .set({ status: "verified" })
          .where(eq(appDeploymentFile.id, file.id));
      } catch (error) {
        await db
          .update(appDeploymentFile)
          .set({ status: "failed" })
          .where(eq(appDeploymentFile.id, file.id));
        await db
          .update(appDeployment)
          .set({ status: "uploading" })
          .where(eq(appDeployment.id, deployment.id));

        throw new ORPCError("BAD_REQUEST", {
          message: error instanceof Error ? error.message : "Failed to verify deployment file.",
        });
      }
    }

    const [publishedDeployment] = await db
      .update(appDeployment)
      .set({ status: "published" })
      .where(eq(appDeployment.id, deployment.id))
      .returning();

    if (!publishedDeployment) {
      throw new ORPCError("BAD_REQUEST", { message: "Failed to publish deployment." });
    }

    if (input.body.rollout) {
      await db
        .update(app)
        .set({ currentDeploymentId: publishedDeployment.id })
        .where(and(eq(app.id, context.app.id), eq(app.projectId, context.project.id)));
    }

    return {
      body: withAssetUrl(publishedDeployment, context.organization.publicId, context.project.id),
    };
  });

export const deploymentRouter = o.prefix("/deployments").router({
  list: listAppDeployments,
  get: getAppDeployment,
  create: createAppDeployment,
  publish: publishAppDeployment,
});
