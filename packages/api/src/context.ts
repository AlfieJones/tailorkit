import { auth } from "@tailorkit/auth";
import type { Session, User } from "@tailorkit/auth";
import { initializeObservability, setSpanAttributes, withSpan } from "@tailorkit/observability";
import { ipAddress } from "@vercel/functions";

export interface Context {
  session: Session | null | undefined;
  user: User | null | undefined;
  ip: string;
  headers: Headers;
}

export async function createContext({ request }: { request: Request }): Promise<Context> {
  await initializeObservability("tailorkit-web");

  return withSpan("api.create_context", async () => {
    const sessionData = await auth.api.getSession({
      headers: request.headers,
    });
    const ip = ipAddress(request) ?? "unknown";

    setSpanAttributes({
      "tailorkit.package": "api",
      "tailorkit.authenticated": Boolean(sessionData?.user),
    });

    return {
      session: sessionData?.session,
      user: sessionData?.user,
      ip,
      headers: request.headers,
    };
  });
}
