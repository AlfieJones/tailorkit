import { auth } from "@tailorkit/auth";

export async function createContext({ req }: { req: Request }) {
  const sessionData = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    session: sessionData?.session,
    user: sessionData?.user,
    headers: req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
