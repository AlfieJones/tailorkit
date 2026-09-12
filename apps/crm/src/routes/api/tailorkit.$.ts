import { createFileRoute } from "@tanstack/react-router";
import { tailorKit } from "#lib/tailorkit";

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) =>
        tailorKit.handler(request, {
          authenticate: () => ({ scopeId: "crm-demo" }),
        }),
    },
  },
});
