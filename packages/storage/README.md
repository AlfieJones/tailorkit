# @tailorkit/storage

Provider-neutral object storage for TailorKit.

## Local RustFS

Start the local S3-compatible RustFS service:

```bash
pnpm services:start
```

Use these environment variables:

```env
BLOB_PROVIDER=s3
BLOB_BUCKET=tailorkit
BLOB_ENDPOINT=http://localhost:9000
BLOB_REGION=auto
BLOB_ACCESS_KEY_ID=rustfsadmin
BLOB_SECRET_ACCESS_KEY=rustfsadmin
BLOB_FORCE_PATH_STYLE=true
```

The same `s3` provider works with any S3-compatible service by changing the
endpoint, bucket, and credentials.

## Vercel Blob

Use Vercel Blob with private access:

```env
BLOB_PROVIDER=vercel
BLOB_READ_WRITE_TOKEN=...
```

Uploads use `access: "private"` by default.
