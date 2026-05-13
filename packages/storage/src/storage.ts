import { env } from "@tailorkit/env/server";
import { createS3CompatibleStorage } from "./s3.js";
import type { Storage } from "./types.js";
import { createVercelBlobStorage } from "./vercel-blob.js";

type StorageInstance = Storage<"s3"> | Storage<"vercel-blob"> | null;

let instance: StorageInstance | undefined;

function createStorage(): StorageInstance {
  if (env.STORAGE_PROVIDER === "vercel-blob") {
    return createVercelBlobStorage();
  }

  if (env.STORAGE_PROVIDER === "s3") {
    return createS3CompatibleStorage({
      bucket: env.STORAGE_BUCKET!,
      region: env.STORAGE_REGION,
      endpoint: env.STORAGE_ENDPOINT,
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      forcePathStyle: env.STORAGE_FORCE_PATH_STYLE ?? Boolean(env.STORAGE_ENDPOINT),
      publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
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
