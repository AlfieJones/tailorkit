import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "@tailorkit/api/context";
import { appRouter } from "@tailorkit/api/routers/index";
import { RatelimitHandlerPlugin } from "@tailorkit/api/rate-limiting";
import { createFileRoute } from "@tanstack/react-router";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  plugins: [new RatelimitHandlerPlugin()],
});

async function handle({ request }: { request: Request }) {
  const rpcResult = await rpcHandler.handle(request, {
    context: await createContext({ request }),
    prefix: "/api/rpc",
  });
  if (rpcResult.response) {
    return rpcResult.response;
  }

  return new Response("Not found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
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
