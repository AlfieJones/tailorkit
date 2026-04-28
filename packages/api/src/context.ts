import { auth } from "@tailorkit/auth";
import type { Session, User } from "@tailorkit/auth";
import { ipAddress } from "@vercel/functions";

export interface Context {
  session: Session | null | undefined;
  user: User | null | undefined;
  ip: string;
  headers: Headers;
}

export async function createContext({ request }: { request: Request }): Promise<Context> {
  const sessionData = await auth.api.getSession({
    headers: request.headers,
  });

  return {
    session: sessionData?.session,
    user: sessionData?.user,
    ip: ipAddress(request) ?? "unknown",
    headers: request.headers,
  };
}
