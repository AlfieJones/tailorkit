# @tailorkit/storage

Provider-neutral object storage for TailorKit.

## Local RustFS

Start the local S3-compatible RustFS service:

```bash
pnpm services:start
```

Use these environment variables:

```env
STORAGE_PROVIDER=s3
STORAGE_BUCKET=tailorkit
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=auto
STORAGE_ACCESS_KEY_ID=rustfsadmin
STORAGE_SECRET_ACCESS_KEY=rustfsadmin
STORAGE_FORCE_PATH_STYLE=true
```

The same `s3` provider works with any S3-compatible service by changing the
endpoint, bucket, and credentials.

## Vercel Blob

Use Vercel Blob with private access:

```env
STORAGE_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=...
```

Uploads use `access: "private"` by default.
