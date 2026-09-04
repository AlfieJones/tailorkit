# Clover CRM showcase

A local-first CRM example for the TailorKit website. All demo state (contacts, tasks, and the Stripe connection) is stored in the visitor's browser via `localStorage`.

## Local development

```bash
pnpm --filter crm-showcase dev
```

## Vercel

Create a new Vercel project from this repository with **Root Directory** set to `apps/crm`. The Nitro Vite plugin emits Vercel's Build Output API format. No environment variables are required.

After the first production deployment, assign `crm.tailorkit.dev` under **Project → Settings → Domains**.
