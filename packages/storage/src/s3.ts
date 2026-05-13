import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  CreateDownloadUrlInput,
  CreateDownloadUrlOutput,
  CreateUploadUrlInput,
  CreateUploadUrlOutput,
  DeleteObjectInput,
  GetObjectInput,
  GetObjectOutput,
  PutObjectInput,
  PutObjectOutput,
  Storage,
  StorageBody,
} from "./types.js";

export interface S3CompatibleStorageOptions {
  bucket: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
  publicBaseUrl?: string;
}

function toSdkBody(body: StorageBody): PutObjectCommand["input"]["Body"] {
  if (body instanceof ArrayBuffer) {
    return new Uint8Array(body);
  }

  return body as PutObjectCommand["input"]["Body"];
}

function toWebReadableStream(body: unknown): ReadableStream {
  if (body instanceof ReadableStream) {
    return body;
  }

  const maybeWebStream = body as { transformToWebStream?: () => ReadableStream };
  if (maybeWebStream.transformToWebStream) {
    return maybeWebStream.transformToWebStream();
  }

  throw new Error("Storage object body is not a readable stream.");
}

function createS3Client(options: S3CompatibleStorageOptions): S3Client {
  const config: S3ClientConfig = {
    region: options.region ?? "auto",
    endpoint: options.endpoint,
    forcePathStyle: options.forcePathStyle ?? Boolean(options.endpoint),
  };

  if (options.accessKeyId && options.secretAccessKey) {
    config.credentials = {
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
    };
  }

  return new S3Client(config);
}

function objectUrl(options: S3CompatibleStorageOptions, key: string): string | undefined {
  if (!options.publicBaseUrl) {
    return undefined;
  }

  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${options.publicBaseUrl.replace(/\/$/u, "")}/${encodedKey}`;
}

export function createS3CompatibleStorage(options: S3CompatibleStorageOptions): Storage<"s3"> {
  const client = createS3Client(options);

  return {
    type: "s3",
    put: async (input: PutObjectInput): Promise<PutObjectOutput> => {
      const result = await client.send(
        new PutObjectCommand({
          Bucket: options.bucket,
          Key: input.key,
          Body: toSdkBody(input.body),
          ContentType: input.contentType,
          CacheControl: input.cacheControl,
          Metadata: input.metadata,
        }),
      );

      return {
        key: input.key,
        url: objectUrl(options, input.key),
        contentType: input.contentType,
        etag: result.ETag,
      };
    },
    get: async (input: GetObjectInput): Promise<GetObjectOutput> => {
      const result = await client.send(
        new GetObjectCommand({
          Bucket: options.bucket,
          Key: input.key,
        }),
      );

      return {
        key: input.key,
        body: toWebReadableStream(result.Body),
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        etag: result.ETag,
        metadata: result.Metadata,
      };
    },
    delete: async (input: DeleteObjectInput): Promise<void> => {
      await client.send(
        new DeleteObjectCommand({
          Bucket: options.bucket,
          Key: input.key,
        }),
      );
    },
    createUploadUrl: async (input: CreateUploadUrlInput): Promise<CreateUploadUrlOutput> => {
      const command = new PutObjectCommand({
        Bucket: options.bucket,
        Key: input.key,
        ContentType: input.contentType,
        Metadata: input.metadata,
      });

      return {
        key: input.key,
        uploadUrl: await getSignedUrl(client, command, {
          expiresIn: input.expiresInSeconds ?? 300,
        }),
        headers: input.contentType ? { "content-type": input.contentType } : undefined,
      };
    },
    createDownloadUrl: async (input: CreateDownloadUrlInput): Promise<CreateDownloadUrlOutput> => {
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: input.key,
      });

      return {
        key: input.key,
        url: await getSignedUrl(client, command, {
          expiresIn: input.expiresInSeconds ?? 300,
        }),
      };
    },
  };
}
