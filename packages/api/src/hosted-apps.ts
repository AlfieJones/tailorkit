import { db } from "@tailorkit/db";
import {
  app as hostedApp,
  appVersion,
  appVersionClientFile,
  pendingAssetUpload,
} from "@tailorkit/db/schema/apps";
import { getStorage } from "@tailorkit/storage";
import { eq } from "drizzle-orm";
import { z } from "zod";

const clientContentType = "application/javascript";
const uploadIntentTtlMs = 15 * 60 * 1000;

const uploadMetadataSchema = z
  .object({
    appId: z.string().min(1).optional(),
    checksumSha256: z
      .string()
      .regex(/^[a-f0-9]{64}$/iu)
      .transform((value) => value.toLowerCase())
      .optional(),
    description: z.string().optional(),
    name: z.string().optional(),
    projectId: z.string().uuid().optional(),
  })
  .passthrough()
  .default({})
  .transform((metadata) => ({ ...metadata, appId: metadata.appId ?? "default" }));

export interface CreateHostedAppVersionInput {
  manifest?: unknown;
  maxBytes: number;
  projectId: string;
  scopeId: string;
}

export interface PublishHostedAppVersionInput {
  clientEntryUploadId: string;
  projectId: string;
  scopeId: string;
}

export interface GetActiveHostedAppClientInput {
  appId: string;
  projectId: string;
  scopeId: string;
}

const objectKeyForUpload = (input: {
  appKey: string;
  scopeId: string;
  uploadId: string;
}): string => {
  const scopeId = encodeURIComponent(input.scopeId);
  const appKey = encodeURIComponent(input.appKey);
  return `hosted-apps/${scopeId}/${appKey}/${input.uploadId}/client.js`;
};

const requireStorage = () => {
  const storage = getStorage();
  if (!storage) {
    throw new Error("Object storage is not configured.");
  }
  return storage;
};

const findOrCreateApp = async (input: {
  description?: string;
  key: string;
  name?: string;
  projectId: string;
  scopeId: string;
}) => {
  const existing = await db.query.app.findFirst({
    where: {
      key: input.key,
      projectId: input.projectId,
      scopeId: input.scopeId,
    },
  });

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(hostedApp)
    .values({
      description: input.description,
      key: input.key,
      name: input.name,
      projectId: input.projectId,
      scopeId: input.scopeId,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create hosted app.");
  }

  return created;
};

export async function createHostedAppVersion(input: CreateHostedAppVersionInput) {
  const storage = requireStorage();
  if (!storage.createUploadUrl) {
    throw new Error("Object storage does not support direct uploads.");
  }

  const uploadMetadata = uploadMetadataSchema.parse(input.manifest);
  const projectId = input.projectId;

  const app = await findOrCreateApp({
    description: uploadMetadata.description,
    key: uploadMetadata.appId,
    name: uploadMetadata.name,
    projectId,
    scopeId: input.scopeId,
  });
  const expiresAt = new Date(Date.now() + uploadIntentTtlMs);
  const [upload] = await db
    .insert(pendingAssetUpload)
    .values({
      appId: app.id,
      checksumSha256: uploadMetadata.checksumSha256,
      kind: "client_entry",
      maxBytes: input.maxBytes,
      objectKey: "pending",
      projectId,
      uploadExpiresAt: expiresAt,
    })
    .returning();

  if (!upload) {
    throw new Error("Failed to create pending asset upload.");
  }

  const objectKey = objectKeyForUpload({
    appKey: app.key,
    scopeId: app.scopeId,
    uploadId: upload.id,
  });

  await db
    .update(pendingAssetUpload)
    .set({ objectKey })
    .where(eq(pendingAssetUpload.id, upload.id));

  const uploadUrl = await storage.createUploadUrl({
    contentType: clientContentType,
    key: objectKey,
    metadata: {
      appId: app.key,
      scopeId: app.scopeId,
      uploadId: upload.id,
    },
  });

  return {
    clientEntryUploadId: upload.id,
    headers: uploadUrl.headers,
    id: upload.id,
    maxBytes: upload.maxBytes,
    uploadUrl: uploadUrl.uploadUrl,
  };
}

export async function publishHostedAppVersion(input: PublishHostedAppVersionInput) {
  const storage = requireStorage();
  const upload = await db.query.pendingAssetUpload.findFirst({
    where: {
      id: input.clientEntryUploadId,
      kind: "client_entry",
      projectId: input.projectId,
      status: "uploading",
    },
    with: {
      app: true,
    },
  });

  if (!upload || !upload.app || upload.app.scopeId !== input.scopeId) {
    throw new Error("Pending client upload not found.");
  }

  if (upload.uploadExpiresAt.getTime() <= Date.now()) {
    await db
      .update(pendingAssetUpload)
      .set({ failureReason: "Upload URL expired.", status: "failed" })
      .where(eq(pendingAssetUpload.id, upload.id));
    throw new Error("Pending client upload has expired.");
  }

  const object = await storage.head({ key: upload.objectKey });
  if (object.contentLength !== undefined && object.contentLength > upload.maxBytes) {
    await db
      .update(pendingAssetUpload)
      .set({ failureReason: "Uploaded client file exceeds the maximum size.", status: "failed" })
      .where(eq(pendingAssetUpload.id, upload.id));
    throw new Error("Uploaded client file exceeds the maximum size.");
  }

  const verifiedAt = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(pendingAssetUpload)
      .set({ status: "verifying" })
      .where(eq(pendingAssetUpload.id, upload.id));

    const [version] = await tx
      .insert(appVersion)
      .values({
        appId: upload.appId,
        status: "verifying",
      })
      .returning({ id: appVersion.id });

    if (!version) {
      throw new Error("Failed to create app version.");
    }

    await tx.insert(appVersionClientFile).values({
      checksumSha256: upload.checksumSha256,
      contentLength: object.contentLength,
      contentType: object.contentType,
      etag: object.etag,
      objectKey: upload.objectKey,
      verifiedAt,
      versionId: version.id,
    });

    await tx
      .update(appVersion)
      .set({ publishedAt: verifiedAt, status: "published" })
      .where(eq(appVersion.id, version.id));

    await tx
      .update(hostedApp)
      .set({ activeVersionId: version.id })
      .where(eq(hostedApp.id, upload.appId));

    await tx
      .update(pendingAssetUpload)
      .set({ consumedAt: verifiedAt, status: "consumed", verifiedAt })
      .where(eq(pendingAssetUpload.id, upload.id));
  });

  return { id: upload.id, ok: true };
}

export async function listHostedApps(input: { projectId: string; scopeId: string }) {
  const apps = await db.query.app.findMany({
    where: {
      projectId: input.projectId,
      scopeId: input.scopeId,
    },
    orderBy: { createdAt: "desc" },
    with: {
      activeVersion: {
        with: {
          clientFile: true,
        },
      },
    },
  });

  return apps.flatMap((app) => {
    if (!app.activeVersion?.clientFile) {
      return [];
    }
    return [
      {
        description: app.description,
        id: app.key,
        name: app.name,
      },
    ];
  });
}

export async function getActiveHostedAppClient(input: GetActiveHostedAppClientInput) {
  const storage = requireStorage();
  const app = await db.query.app.findFirst({
    where: {
      key: input.appId,
      projectId: input.projectId,
      scopeId: input.scopeId,
    },
    with: {
      activeVersion: {
        with: {
          clientFile: true,
        },
      },
    },
  });

  if (!app) {
    throw new Error("Hosted app not found.");
  }

  const clientFile = app.activeVersion?.clientFile;
  if (!clientFile) {
    throw new Error("Hosted app client file not found.");
  }

  if (!storage.createDownloadUrl) {
    throw new Error("Object storage does not support download URLs.");
  }

  const downloadUrl = await storage.createDownloadUrl({ key: clientFile.objectKey });
  return downloadUrl.url;
}
