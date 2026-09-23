# TanStack Start TailorKit Example

This example shows a host product that exposes TailorKit views, slots, components,
theme tokens, and actions from a TanStack Start application.

## Run the example

From the repository root:

```sh
corepack enable
pnpm install
```

Create `examples/tanstack-start/.env`:

```env
TAILORKIT_PROJECT_KEY="your-project-key"
```

Start the local TailorKit platform and services in one terminal:

```sh
pnpm dev
```

Then start the example in another terminal:

```sh
pnpm --filter tanstack-start dev
```

Open `http://localhost:5010`. The example's TailorKit API handler is available
at `http://localhost:5010/api/tailorkit`.

## Preview an example app

For local previews, set `KV_PROVIDER=redis` and
`KV_REDIS_URL=redis://localhost:6379` in `apps/web/.env.local` before
starting `pnpm dev`.

After deploying the todo app once and running `tailorkit login` for this host,
start its live preview from the repository root:

```sh
pnpm --filter todo exec tailorkit preview
```

The CLI prints a link such as
`http://localhost:5010/api/tailorkit/preview?session=<session-id>`. Open it,
choose “Use preview,” and then select the todo app. Edits under
`examples/apps/todo/src` rebuild the app; the open panel reloads after the
build and resets its local state. Use `--url` to return to a different page on
the same host. Others can open the link while the CLI is running if they can
reach that host URL and sign in to the same scope.

## Relevant files

- `src/lib/tailorkit.ts` defines the server contract.
- `src/routes/api/tailorkit.$.ts` mounts the API handler and authentication
  context.
- `src/lib/tailorkit-client.tsx` maps contract components to React renderers.
- `src/components/tailorkit-shell.tsx` loads installed apps, publishes the root
  view context with `useView`, and renders the selected app in its slot.

The example defaults to the platform at `http://localhost:3000` and the
SeaweedFS service started by the root development command. Set
`TAILORKIT_PLATFORM_BASE_URL` or `TAILORKIT_ASSETS_BASE_URL` to point it at
different services.
