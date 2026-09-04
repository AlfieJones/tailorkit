import { handleAssetRequest } from "@tailorkit/api-platform/assets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/assets/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAssetRequest(request),
      HEAD: ({ request }) => handleAssetRequest(request),
      OPTIONS: ({ request }) => handleAssetRequest(request),
    },
  },
});
