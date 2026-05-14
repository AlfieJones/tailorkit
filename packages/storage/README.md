# @tailorkit/storage

S3-compatible object storage for TailorKit.

## Local S3

Start the local S3-compatible SeaweedFS service:

```bash
pnpm services:start
```

Use these environment variables:

```env
BLOB_BUCKET=tailorkit
BLOB_ENDPOINT=http://localhost:8333
BLOB_REGION=us-east-1
BLOB_ACCESS_KEY_ID=some_access_key
BLOB_SECRET_ACCESS_KEY=some_secret_key
BLOB_FORCE_PATH_STYLE=true
```

The same configuration shape works with any S3-compatible service, including
R2, S3, MinIO, and SeaweedFS, by changing the endpoint, bucket, and credentials.
