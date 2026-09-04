# Asset infrastructure

SST owns the asset Worker, proxied wildcard DNS, Worker route and private R2
bucket. Vercel continues to build the platform independently. Wrangler is only
for local Worker development and bundle checks; do not use it to deploy.

Production keeps `tailorkit-assets`, `tailorkit-app-assets-prod` and
`*.tailorkit.app`. SST imports the existing production bucket and protects it
from deletion. Staging uses separate Worker/bucket names and an explicitly
configured domain and backend. No tenant-specific infrastructure is created.

## Configure once

Create GitHub environments `staging-platform` and `production-platform`; require
reviewers for production and restrict deployment branches to main.

Environment secrets:

- `CLOUDFLARE_API_TOKEN`: scoped to the selected account/zone, with permissions
  for Workers scripts/routes, DNS, zone reads and R2 management. SST also needs
  access to its Cloudflare-backed state; its state bucket is separate from assets.
- `ASSET_GATEWAY_SECRET`: a random secret of at least 32 characters. The workflow
  writes the same value as a Worker secret binding and a sensitive, server-only
  Vercel environment variable. Never prefix it with `VITE_`.
- `VERCEL_TOKEN`: authorized to update the selected backend project's environment.

Environment variables:

- `CLOUDFLARE_DEFAULT_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`.
- `ASSET_VERCEL_PROJECT_ID`, `ASSET_VERCEL_TEAM_ID`: the platform backend, not CRM.
- Staging only: `ASSET_DOMAIN` and HTTPS `PLATFORM_ORIGIN`. Use a dedicated staging
  Vercel backend project with its own database and R2 credentials. The sync targets
  that project's production environment, not arbitrary PR previews.
- `ASSET_TLS_VERIFIED=true`: acknowledge that the exact wildcard has active TLS
  coverage. A deeper staging wildcard such as `*.staging.tailorkit.app` needs
  appropriate certificate coverage; do not assume the apex certificate covers it.
- If resources already exist, set `ASSET_DNS_RECORD_ID`,
  `ASSET_WORKER_ROUTE_ID`, and/or `ASSET_IMPORT_WORKER=true` before adoption.
  Inspect the first diff for replacements or changes to existing DNS settings.

The Vercel backend must already have its private bucket-scoped R2 credentials.
The sync changes only asset domain, gateway secret, bucket, endpoint, region and
path-style settings. It does not change database/auth/R2 access credentials.

## Preview and deploy

Run the **Deploy asset infrastructure** GitHub workflow from main with operation
`diff` first (the default), then explicitly choose `deploy` after reviewing it.
The workflow tests the gateway and infrastructure, deploys SST, then syncs Vercel
settings. Production bucket adoption fails if the original bucket is absent.

Equivalent local commands, with the environment above loaded securely:

```sh
pnpm infra:install
node infra/command.ts validate staging
pnpm infra:diff -- --stage staging
pnpm infra:deploy -- --stage staging
node infra/command.ts sync-vercel staging
```

On the first rollout, apply the public-team-ID database migration before deploying
the updated platform backend. After infrastructure and environment sync, redeploy
the matching Vercel backend: environment updates do not change existing builds.
Verify a published demo app end-to-end before rolling out production.

Secret rotation is not atomic across Cloudflare and Vercel. Keep the secret stable
for normal deploys; coordinate Worker changes and backend redeployment when
rotating it. If environment sync fails after SST succeeds, fix the credentials and
retry the sync; infrastructure deployment does not roll back automatically.

SST state and generated provider files are ignored by Git. Do not delete remote
state or remove resource protections to force adoption. Review SST/provider upgrades
explicitly; both versions are pinned in `sst.config.ts`.
