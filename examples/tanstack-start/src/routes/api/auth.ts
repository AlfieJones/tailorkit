import { createFileRoute } from "@tanstack/react-router";
import { demoAuthHandler } from "@examples/shared";

const handleAuthRequest = ({ request }: { request: Request }) => demoAuthHandler(request);

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      GET: handleAuthRequest,
      POST: handleAuthRequest,
    },
  },
});
