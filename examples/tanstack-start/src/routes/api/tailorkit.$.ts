import { auth } from "#/lib/auth";
import { tailorKit } from "#/lib/tailorkit";
import { createFileRoute } from "@tanstack/react-router";

const handle = ({ request }: { request: Request }) =>
  tailorKit.handler(request, {
    authenticate: async () => {
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        return null;
      }

      return {
        actionContext: { user: session.user },
        scopeId: session.user.id,
      };
    },
  });

export const Route = createFileRoute("/api/tailorkit/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
