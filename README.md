# TailorKit

TailorKit is infrastructure for adding a secure app ecosystem to a SaaS
product.

The host product owns the routes, data, permissions, actions, and design system.
TailorKit apps run separately, in a sandboxed iframe with an internal worker,
and render through the screens and components the host exposes. That lets
customers, partners, or AI builders extend a product without getting direct
access to the product internals.

## What This Repo Contains

- `tailorkit`: the public package entry point.
- `@tailorkit/core`: schema, server handler, actions, and platform routing.
- `@tailorkit/react`: React host runtime for rendering installed apps.
- `@tailorkit/app`: app-side client, config loader, and build pipeline.
- `@tailorkit/sandbox`: iframe sandbox, worker runtime, and host protocol.
- `@tailorkit/cli`: local app preview and deployment commands.
- `apps/web`: the TailorKit platform app.
- `apps/docs`: the docs site.
- `examples/tanstack-start`: a host product example.

## How It Works

1. A host defines a TailorKit schema: screens, components, theme tokens, and
   server actions.
2. Apps are built against that schema.
3. Host routes call `useCurrentScreen` to publish their typed context.
4. The host renders installed apps with `AppView`.
5. TailorKit loads app code inside an opaque-origin iframe sandbox and proxies
   UI/events across the host boundary.

Apps describe UI. The host renders the real UI and keeps control of sensitive
work.

## Documentation

- [Overview](https://tailorkit.dev/docs) explains the TailorKit model and core
  terminology.
- [Installation](https://tailorkit.dev/docs/installation) walks through a host
  integration.
- [Quickstart](https://tailorkit.dev/docs/quickstart) creates and previews a
  first TailorKit app.
- [Writing apps](https://tailorkit.dev/docs/writing-apps) covers the app-side
  runtime and generated bindings.

## Development

This repository is a pnpm workspace managed with Turborepo. Use the pnpm
version declared in `package.json`.

```sh
corepack enable
pnpm install
```

Run the platform app and its local services:

```sh
pnpm dev
```

Run only the documentation site:

```sh
pnpm dev:docs
```

### Validation

```sh
pnpm check-types
pnpm test
pnpm check
pnpm build
```

`pnpm check` runs the repository lint and formatting checks. Run the narrower
type or test command while iterating, then run all four commands before opening
a pull request.

### Local services

Local services are managed through Docker Compose:

```sh
pnpm services:start
pnpm services:stop
```

Use `pnpm services:watch` to keep service logs attached, or
`pnpm services:down` to stop and remove the local containers.

### GitHub authentication

The platform uses Better Auth's GitHub provider. It also uses Better Auth's OAuth proxy so one
production callback can safely serve Vercel production and ephemeral preview deployments.

1. In GitHub, open **Settings → Developer settings → GitHub Apps → New GitHub App**.
2. Set the homepage to the production site, grant **Account permissions → Email addresses:
   Read-only**, and set the authorization callback URL to:

   ```text
   https://YOUR_PRODUCTION_DOMAIN/api/auth/callback/github
   ```

   Repository and organization permissions are not required for authentication, and the webhook can
   remain disabled until the app gains integration features.

3. Generate a client secret on the GitHub App's General settings page, then add these server-only
   variables to the Vercel project for both **Production** and **Preview**:

   ```text
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   AUTH_PRODUCTION_URL=https://YOUR_PRODUCTION_DOMAIN
   OAUTH_PROXY_SECRET=...
   AUTH_TRUSTED_ORIGINS=https://YOUR_PROJECT-*.vercel.app
   ```

   `OAUTH_PROXY_SECRET` must be the same value in production and preview and contain at least 32
   characters. Generate it with `openssl rand -base64 32`. Keep it separate from `AUTH_SECRET`.
   Replace the trusted-origin pattern with the narrow Vercel preview hostname pattern for this
   project; do not use a blanket `https://*.vercel.app` pattern.

4. Redeploy production once, then deploy a preview. GitHub only needs the production callback URL;
   the OAuth proxy returns users to the exact preview deployment where they started.

For local development, add the same variables to `apps/web/.env.local`, set
`AUTH_TRUSTED_ORIGINS=http://localhost:3000,https://YOUR_PROJECT-*.vercel.app`, and keep
`AUTH_PRODUCTION_URL` pointed at the deployed production site. The production deployment must be
running the OAuth proxy before local or preview GitHub sign-in can complete.

## License

TailorKit is licensed under AGPL-3.0-only. See [LICENSE](./LICENSE).
