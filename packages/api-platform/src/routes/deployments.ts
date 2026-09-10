import { ORPCError } from "@orpc/server";
import { db } from "@tailorkit/db";
import {
  app,
  AppDeployment,
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
import { maxDeploymentBytes, maxLogoBytes, validateLogoAsset } from "@tailorkit/asset-delivery";
import type { LogoContentType } from "@tailorkit/asset-delivery";

const uploadUrlExpiresInSeconds = 15 * 60;
const logoExtensionByContentType = {
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
} as const;

const deploymentFileMetadataShape = {
  checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/iu)
    .transform((checksum) => checksum.toLowerCase()),
};

const createDeploymentAssetInput = z.object({
  ...deploymentFileMetadataShape,
  contentLength: z.number().int().min(1),
  contentType: z.literal("application/javascript"),
  encoding: z.literal("utf-8"),
  objectKey: z.literal("client.js"),
});

const createDeploymentLogoInput = z.object({
  ...deploymentFileMetadataShape,
  contentLength: z.number().int().min(1).max(maxLogoBytes),
  contentType: z.enum(["image/svg+xml", "image/png", "image/webp"]),
});

const createDeploymentInput = z
  .object({
    appId: z.string(),
    assets: z.tuple([createDeploymentAssetInput]),
    logos: z
      .object({
        dark: createDeploymentLogoInput.optional(),
        light: createDeploymentLogoInput.optional(),
      })
      .optional(),
    scopeId: z.string(),
  })
  .refine(
    ({ assets }) =>
      assets.reduce((total, asset) => total + asset.contentLength, 0) <= maxDeploymentBytes,
    { message: `Combined client assets cannot exceed ${maxDeploymentBytes} bytes.` },
  );

const deploymentAssetUpload = z.object({
  file: AppDeploymentFile,
  headers: z.record(z.string(), z.string()).optional(),
  uploadUrl: z.url(),
});

const deploymentLogoUploads = z.object({
  dark: deploymentAssetUpload.optional(),
  light: deploymentAssetUpload.optional(),
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
  .output(paginatedOutput(AppDeployment))
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
        items: deployments.slice(0, pageSize),
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
  .output(z.object({ body: AppDeployment }))
  .use(requireDeployment, ({ params: { deploymentId }, query: { scopeId } }) => ({
    deploymentId,
    scopeId,
  }))
  .handler(({ context }) => ({ body: context.deployment }));

const createAppDeployment = protectedRouter
  .route({
    path: "/",
    method: "POST",
  })
  .input(
    z.object({
      body: createDeploymentInput,
    }),
  )
  .output(
    z.object({
      body: z.object({
        assets: z.array(deploymentAssetUpload),
        deployment: AppDeployment,
        logos: deploymentLogoUploads.optional(),
      }),
    }),
  )
  .use(requireApp, ({ body: { appId, scopeId } }) => ({ appId, scopeId }))
  .handler(async ({ context, input }) => {
    const deploymentId = crypto.randomUUID();
    const deploymentPublicId = createPublicId();
    const requestedLogos = Object.entries(input.body.logos ?? {}).map(([variant, logo]) => ({
      asset: {
        ...logo,
        encoding: null,
        objectKey: `logo-${variant}.${logoExtensionByContentType[logo.contentType]}`,
      },
      variant,
    }));
    const requestedAssets = [...input.body.assets, ...requestedLogos.map(({ asset }) => asset)];
    const assets = await Promise.all(
      requestedAssets.map(async (asset) => {
        const fileId = crypto.randomUUID();
        const objectKey = `teams/${context.organization.publicId}/projects/${context.project.id}/apps/${context.app.publicId}/deployments/${deploymentPublicId}/files/${asset.objectKey}`;
        const uploadUrl = await context.storage.createUploadUrl({
          checksumSha256: hexToBase64(asset.checksum),
          contentType: asset.contentType,
          expiresInSeconds: uploadUrlExpiresInSeconds,
          key: objectKey,
          metadata: { appDeploymentId: deploymentId, appId: context.app.id, fileId },
        });
        return { asset, fileId, objectKey, uploadUrl };
      }),
    );

    const created = await db.transaction(async (tx) => {
      const [deployment] = await tx
        .insert(appDeployment)
        .values({
          id: deploymentId,
          appId: context.app.id,
          publicId: deploymentPublicId,
          status: "uploading",
        })
        .returning();

      if (!deployment) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create deployment." });
      }

      const files = await tx
        .insert(appDeploymentFile)
        .values(
          assets.map(({ asset, fileId, objectKey }) => ({
            id: fileId,
            appDeploymentId: deployment.id,
            checksum: asset.checksum,
            contentLength: asset.contentLength,
            contentType: asset.contentType,
            encoding: asset.encoding,
            objectKey,
          })),
        )
        .returning();

      if (files.length !== assets.length) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to create deployment asset." });
      }

      const fileByName = new Map(
        files.map((file) => [file.objectKey.slice(file.objectKey.lastIndexOf("/") + 1), file]),
      );
      const logoDarkPath = requestedLogos.find(({ variant }) => variant === "dark")?.asset
        .objectKey;
      const logoLightPath = requestedLogos.find(({ variant }) => variant === "light")?.asset
        .objectKey;

      const [updatedDeployment] = await tx
        .update(appDeployment)
        .set({
          clientEntryFileId: fileByName.get("client.js")?.id,
          logoDarkFileId: logoDarkPath ? fileByName.get(logoDarkPath)?.id : undefined,
          logoLightFileId: logoLightPath ? fileByName.get(logoLightPath)?.id : undefined,
          logoDarkPath,
          logoLightPath,
        })
        .where(eq(appDeployment.id, deployment.id))
        .returning();

      if (!updatedDeployment) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to update deployment asset." });
      }

      return { createdDeployment: updatedDeployment, createdFiles: files };
    });
    const { createdDeployment, createdFiles } = created;
    const createdFileById = new Map(createdFiles.map((file) => [file.id, file]));
    const uploadedAssetByName = new Map(
      assets.map(({ asset, fileId, uploadUrl }) => {
        const file = createdFileById.get(fileId);
        if (!file) {
          throw new ORPCError("BAD_REQUEST", { message: "Failed to resolve deployment asset." });
        }
        return [
          asset.objectKey,
          {
            file,
            headers: uploadUrl.headers,
            uploadUrl: uploadUrl.uploadUrl,
          },
        ] as const;
      }),
    );
    const uploadedAssets = input.body.assets.map((asset) => {
      const upload = uploadedAssetByName.get(asset.objectKey);
      if (!upload) {
        throw new ORPCError("BAD_REQUEST", { message: "Failed to resolve deployment asset." });
      }
      return upload;
    });
    const uploadedLogos = Object.fromEntries(
      requestedLogos.map(({ asset, variant }) => {
        const upload = uploadedAssetByName.get(asset.objectKey);
        if (!upload) {
          throw new ORPCError("BAD_REQUEST", { message: "Failed to resolve deployment asset." });
        }
        return [variant, upload];
      }),
    );

    return {
      body: {
        assets: uploadedAssets,
        deployment: createdDeployment,
        ...(Object.keys(uploadedLogos).length > 0 ? { logos: uploadedLogos } : {}),
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
  .output(z.object({ body: AppDeployment }))
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

        if (file.contentType !== "application/javascript") {
          const download = await context.storage.createDownloadUrl({
            key: file.objectKey,
            expiresInSeconds: 60,
          });
          const response = await fetch(download.url);
          if (!response.ok) {
            throw new Error("Failed to inspect uploaded logo.");
          }
          validateLogoAsset(
            new Uint8Array(await response.arrayBuffer()),
            file.contentType as LogoContentType,
          );
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

    return { body: publishedDeployment };
  });

export const deploymentRouter = o.prefix("/deployments").router({
  list: listAppDeployments,
  get: getAppDeployment,
  create: createAppDeployment,
  publish: publishAppDeployment,
});
