import { createFileRoute } from "@tanstack/react-router";
import { defineSchema, primitives, tailorKit } from "tailorkit";

const tailor = tailorKit({
  basePath: "/api/tailorkit",
  platform: {
    rpcUrl: process.env.TAILORKIT_PLATFORM_RPC_URL ?? "http://localhost:3000/api/rpc",
  },
  schema: defineSchema({ components: { ...primitives } }),
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) => tailor.fetch(request),
    },
  },
});
