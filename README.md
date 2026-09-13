# TailorKit

TailorKit is infrastructure for adding a secure app ecosystem to a SaaS
product.

The host product owns the routes, data, permissions, actions, and design system.
TailorKit apps run separately in a sandboxed iframe and render through the
scopes, viewports, and components the host exposes. That lets
customers, partners, or AI builders extend a product without getting direct
access to the product internals.

## What This Repo Contains

- `tailorkit`: the public package entry point.
- `@tailorkit/core`: schema, server handler, actions, and platform routing.
- `@tailorkit/react`: React host runtime for rendering installed apps.
- `@tailorkit/app`: app-side client, config loader, and build pipeline.
- `@tailorkit/sandbox`: iframe sandbox and host protocol.
- `@tailorkit/cli`: local app preview and deployment commands.
- `apps/web`: the TailorKit platform app.
- `apps/docs`: the docs site.
- `examples/tanstack-start`: a host product example.

## How It Works

1. A host defines a TailorKit schema: scopes, components, theme tokens, and
   server actions.
2. Apps are built against that schema.
3. Host routes call `useScope` to publish their typed context.
4. The host renders installed apps with `AppView`.
5. TailorKit loads app code inside an opaque-origin iframe sandbox and proxies
   declarative UI/events across the host boundary.

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

Run the platform app:

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

## License

TailorKit uses per-package licensing. Generally, the hosted platform and
server-side infrastructure use the Business Source License 1.1, while the
SDKs, framework, client libraries, and developer tooling use Apache-2.0.

For the exact license that applies to a package, see its `package.json` and
`LICENSE.md`. See [LICENSE.md](./LICENSE.md) for the repository overview.
