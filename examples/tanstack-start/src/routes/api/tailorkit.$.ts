import { createFileRoute } from "@tanstack/react-router";
import { defineSchema, primitives, tailorKit } from "tailorkit";

const tailor = tailorKit({
  basePath: "/api/tailorkit",
  schema: defineSchema({ components: { ...primitives } }),
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) => tailor.fetch(request),
    },
  },
});
