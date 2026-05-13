import { del, get, put } from "@vercel/blob";
import type {
  DeleteObjectInput,
  GetObjectInput,
  GetObjectOutput,
  PutObjectInput,
  PutObjectOutput,
  Storage,
} from "./types.js";

function toBlobBody(body: PutObjectInput["body"]): Parameters<typeof put>[1] {
  return body as Parameters<typeof put>[1];
}

export function createVercelBlobStorage(): Storage<"vercel-blob"> {
  return {
    type: "vercel-blob",
    put: async (input: PutObjectInput): Promise<PutObjectOutput> => {
      const blob = await put(input.key, toBlobBody(input.body), {
        access: "private",
        contentType: input.contentType,
      });

      return {
        key: blob.pathname,
        url: blob.url,
        contentType: blob.contentType,
        etag: blob.etag,
      };
    },
    get: async (input: GetObjectInput): Promise<GetObjectOutput> => {
      const result = await get(input.key, { access: "private" });

      if (!result) {
        throw new Error(`Blob not found: ${input.key}`);
      }

      if (result.statusCode === 304 || !result.stream) {
        throw new Error(`Blob not modified: ${input.key}`);
      }

      return {
        key: input.key,
        body: result.stream,
        contentType: result.blob.contentType,
        contentLength: result.blob.size,
        etag: result.blob.etag,
      };
    },
    delete: async (input: DeleteObjectInput): Promise<void> => {
      await del(input.key);
    },
  };
}
