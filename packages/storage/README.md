# @tailorkit/storage

S3-compatible object storage for TailorKit.

## API

```ts
import { getStorage } from "@tailorkit/storage";

const storage = getStorage();

if (storage) {
  const { uploadUrl, headers } = await storage.createUploadUrl({
    contentType: "application/javascript",
    key: "apps/example/client.js",
  });

  await fetch(uploadUrl, {
    body: clientBundle,
    headers,
    method: "PUT",
  });
}
```

`getStorage()` returns `null` when `BLOB_BUCKET` is not configured. Otherwise,
it returns a cached `Storage<"s3">` instance with `head`, `delete`,
`createUploadUrl`, and `createDownloadUrl` methods.

Use `createS3CompatibleStorage(options)` when configuration should not come from
the process environment. Use `uploadToUrl(input)` to upload with a presigned URL
while enforcing the optional `maxBytes` limit.

## Local S3

Start the local S3-compatible SeaweedFS service:

```bash
pnpm services:start
```

Browse local files in the SeaweedFS Filer UI at
[http://localhost:4010](http://localhost:4010).

Use these environment variables:

```env
BLOB_BUCKET=tailorkit
BLOB_ENDPOINT=http://localhost:8333
BLOB_REGION=us-east-1
BLOB_ACCESS_KEY_ID=some_access_key
BLOB_SECRET_ACCESS_KEY=some_secret_key
BLOB_FORCE_PATH_STYLE=true
```

`BLOB_FORCE_PATH_STYLE` defaults to `true` when `BLOB_ENDPOINT` is set. The
explicit value above makes the local behavior clear.

The same configuration shape works with any S3-compatible service, including
R2, S3, MinIO, and SeaweedFS, by changing the endpoint, bucket, and credentials.

## Safety notes

- Keep access keys in server-only environment variables.
- Use short expiry periods for presigned URLs.
- Validate object keys and content types before creating upload URLs.
- Apply provider-side bucket policies and retention rules; presigned URLs do
  not replace storage authorization.
