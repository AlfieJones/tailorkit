export type StorageType = "s3";

export type StorageBody = Blob | Buffer | Uint8Array | ArrayBuffer | ReadableStream;

export interface PutObjectInput {
  key: string;
  body: StorageBody;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export interface PutObjectOutput {
  key: string;
  url?: string;
  contentType?: string;
  size?: number;
  etag?: string;
}

export interface GetObjectInput {
  key: string;
}

export interface GetObjectOutput {
  key: string;
  body: ReadableStream;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  metadata?: Record<string, string>;
}

export interface DeleteObjectInput {
  key: string;
}

export interface CreateUploadUrlInput {
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
  metadata?: Record<string, string>;
}

export interface CreateUploadUrlOutput {
  key: string;
  uploadUrl: string;
  headers?: Record<string, string>;
}

export interface UploadToUrlInput {
  uploadUrl: string;
  body: StorageBody;
  headers?: Record<string, string>;
  contentType?: string;
  maxBytes?: number;
}

export interface CreateDownloadUrlInput {
  key: string;
  expiresInSeconds?: number;
}

export interface CreateDownloadUrlOutput {
  key: string;
  url: string;
}

export interface Storage<T extends StorageType = StorageType> {
  readonly type: T;
  put: (input: PutObjectInput) => Promise<PutObjectOutput>;
  get: (input: GetObjectInput) => Promise<GetObjectOutput>;
  delete: (input: DeleteObjectInput) => Promise<void>;
  createUploadUrl?: (input: CreateUploadUrlInput) => Promise<CreateUploadUrlOutput>;
  createDownloadUrl?: (input: CreateDownloadUrlInput) => Promise<CreateDownloadUrlOutput>;
}
