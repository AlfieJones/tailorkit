import { createFileRoute } from "@tanstack/react-router";
import { createTailorKitServer } from "tailorkit/server";

const tailorkit = createTailorKitServer({
  apps: [
    {
      id: "some-id",
      name: "Notes",
      clientUrl: "http://127.0.0.1:4175",
    },
  ],
  basePath: "/api/tailorkit",
});

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: ({ request }) => tailorkit.handler(request),
    },
  },
});
