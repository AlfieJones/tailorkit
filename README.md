# TailorKit

TailorKit is infrastructure for adding an app ecosystem to a SaaS product.

The host product owns the routes, data, permissions, actions, and design system.
TailorKit apps run separately, in a worker sandbox, and render through the
screens and components the host exposes. That lets customers, partners, or AI
builders extend a product without getting direct access to the product internals.

## What This Repo Contains

- `tailorkit`: the public package entry point.
- `@tailorkit/core`: schema, server handler, actions, and platform routing.
- `@tailorkit/react`: React host runtime for rendering installed apps.
- `@tailorkit/app`: app-side client, config loader, and build pipeline.
- `@tailorkit/sandbox`: worker runtime and host/worker protocol.
- `@tailorkit/cli`: local app preview and deployment commands.
- `apps/web`: the TailorKit platform app.
- `apps/docs`: the docs site.
- `examples/tanstack-start`: a host product example.

## How It Works

1. A host defines a TailorKit schema: screens, components, theme tokens, and
   server actions.
2. Apps are built against that schema.
3. The host mounts `ScreenMatch` in the parts of the product where apps can
   appear.
4. The host renders installed apps with `AppView`.
5. TailorKit loads app code in a sandbox worker and proxies UI/events across the
   host boundary.

Apps describe UI. The host renders the real UI and keeps control of sensitive
work.

## Development

This is a pnpm workspace.

```sh
pnpm install
pnpm dev
```

Useful commands:

```sh
pnpm dev:docs
pnpm build
pnpm check-types
pnpm test
pnpm check
```

Local services are managed through Docker Compose:

```sh
pnpm services:start
pnpm services:stop
```

## License

TailorKit is licensed under AGPL-3.0-only. See [LICENSE](./LICENSE).
