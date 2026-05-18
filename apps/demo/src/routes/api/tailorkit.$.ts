import { createFileRoute } from "@tanstack/react-router";
import { tailorKit } from "tailorkit";
import { createDemoSchema } from "#/lib/tailorkit";
import { defaultTheme } from "#/lib/demo-theme";

const tailor = tailorKit({
  basePath: "/api/tailorkit",
  $internal: {
    platformBaseUrl:
      process.env.TAILORKIT_PLATFORM_BASE_URL ?? "http://localhost:3000/api/platform",
  },
  schema: createDemoSchema(defaultTheme),
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) =>
        tailor.handler(request, {
          requestContext: {},
          resourceId: "demo",
        }),
    },
  },
});
