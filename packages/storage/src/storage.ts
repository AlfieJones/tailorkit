import { env } from "@tailorkit/env/server";
import { createS3CompatibleStorage } from "./s3.js";
import type { Storage } from "./types.js";
import { createVercelBlobStorage } from "./vercel-blob.js";

type StorageInstance = Storage<"s3"> | Storage<"vercel-blob"> | null;

let instance: StorageInstance | undefined;

function createStorage(): StorageInstance {
  if (env.BLOB_PROVIDER === "vercel") {
    return createVercelBlobStorage();
  }

  if (env.BLOB_PROVIDER === "s3") {
    if (!env.BLOB_BUCKET) {
      throw new Error("BLOB_BUCKET is required when BLOB_PROVIDER is s3");
    }

    return createS3CompatibleStorage({
      bucket: env.BLOB_BUCKET,
      region: env.BLOB_REGION,
      endpoint: env.BLOB_ENDPOINT,
      accessKeyId: env.BLOB_ACCESS_KEY_ID,
      secretAccessKey: env.BLOB_SECRET_ACCESS_KEY,
      forcePathStyle: env.BLOB_FORCE_PATH_STYLE ?? Boolean(env.BLOB_ENDPOINT),
      publicBaseUrl: env.BLOB_PUBLIC_BASE_URL,
    });
  }

  return null;
}

export function getStorage(): StorageInstance {
  if (instance !== undefined) {
    return instance;
  }

  instance = createStorage();
  return instance;
}
