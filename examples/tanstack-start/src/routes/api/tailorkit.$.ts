import { createFileRoute } from "@tanstack/react-router";
import { tailorKit } from "tailorkit";

const tailor = tailorKit({
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
      GET: ({ request }) => tailor.handler(request),
    },
  },
});
