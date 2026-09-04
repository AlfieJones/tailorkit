import { resolveAsset } from "@tailorkit/api-platform/assets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/asset-resolve")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await resolveAsset(request);
        } catch {
          // Do not expose signed URLs, credentials or database errors.
          console.error("Asset resolution failed");
          return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});
