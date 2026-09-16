import { useEffect, useState } from "react";

import { Button } from "@tailorkit/ui/components/button";

type DocsSession = {
  user?: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  } | null;
} | null;

const authLinks = {
  dashboard: "/",
  login: "/login",
  signUp: "/sign-up",
};

let cachedSession: DocsSession;
let sessionRequest: Promise<DocsSession> | undefined;

function getSession() {
  sessionRequest ??= fetch("/api/auth/get-session", {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!(response.ok && response.headers.get("content-type")?.includes("application/json"))) {
        return null;
      }

      return (await response.json()) as DocsSession;
    })
    .catch(() => null)
    .then((session) => {
      cachedSession = session;
      return session;
    });

  return sessionRequest;
}

export function NavbarAuth() {
  const [session, setSession] = useState<DocsSession>(cachedSession);

  useEffect(() => {
    let cancelled = false;

    void getSession().then((nextSession) => {
      if (!cancelled) {
        setSession(nextSession);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" render={<a aria-label="Login" href={authLinks.login} />}>
          Login
        </Button>
        <Button size="sm" render={<a aria-label="Sign up" href={authLinks.signUp} />}>
          Sign up
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" render={<a aria-label="Dashboard" href={authLinks.dashboard} />}>
      Dashboard
    </Button>
  );
}
