import { createFileRoute } from "@tanstack/react-router";
import { tailorKit } from "tailorkit";
import { createDemoSchema, demoApps } from "#/lib/tailorkit";
import { defaultTheme } from "#/lib/demo-theme";

const tailor = tailorKit({
  apps: demoApps,
  basePath: "/api/tailorkit",
  schema: createDemoSchema(defaultTheme),
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) => tailor.fetch(request),
    },
  },
});
