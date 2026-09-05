import { handleAssetRequest } from "@tailorkit/api-platform/assets";
import { getStorage } from "@tailorkit/storage";
import { createFileRoute } from "@tanstack/react-router";

function handle({ request }: { request: Request }) {
  return handleAssetRequest(request, getStorage());
}

export const Route = createFileRoute("/api/assets")({
  server: { handlers: { GET: handle, HEAD: handle, OPTIONS: handle } },
});
