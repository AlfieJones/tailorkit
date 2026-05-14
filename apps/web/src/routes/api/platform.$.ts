import { onError } from "@orpc/server";
import { createContext } from "@tailorkit/api-platform/context";
import { platformRouter } from "@tailorkit/api-platform";
import { RatelimitHandlerPlugin } from "@tailorkit/api-utils/rate-limiting";
import { createFileRoute } from "@tanstack/react-router";
import { OpenAPIHandler } from "@orpc/openapi/fetch";

const handler = new OpenAPIHandler(platformRouter, {
  plugins: [new RatelimitHandlerPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  const context = await createContext({ request }).catch((error) => {
    console.error(error);
    throw new Response("Unauthorized", { status: 401 });
  });

  const rpcResult = await handler.handle(request, {
    context,
    prefix: "/api/platform",
  });

  if (rpcResult.response) {
    return rpcResult.response;
  }

  return new Response("Not found", { status: 404 });
}

export const Route = createFileRoute("/api/platform/$")({
  server: {
    handlers: {
      DELETE: handle,
      GET: handle,
      HEAD: handle,
      PATCH: handle,
      POST: handle,
      PUT: handle,
    },
  },
});
