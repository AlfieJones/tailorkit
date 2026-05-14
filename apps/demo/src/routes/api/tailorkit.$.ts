import { createFileRoute } from "@tanstack/react-router";
import { tailorKit } from "tailorkit";
import { createDemoSchema } from "#/lib/tailorkit";
import { defaultTheme } from "#/lib/demo-theme";

const tailor = tailorKit({
  basePath: "/api/tailorkit",
  platform: {
    rpcUrl: process.env.TAILORKIT_PLATFORM_RPC_URL ?? "http://localhost:3000/api/rpc",
  },
  schema: createDemoSchema(defaultTheme),
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) => tailor.fetch(request),
    },
  },
});
