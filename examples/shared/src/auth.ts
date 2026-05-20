export interface DemoUser {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
}

export interface DemoAuthResponse {
  user: DemoUser | null;
}

export const demoUsers = [
  {
    id: "demo-user",
    name: "Demo User",
    email: "demo@example.com",
    profileImageUrl: "https://i.pravatar.cc/160?u=demo@example.com",
  },
] as const satisfies DemoUser[];

export const demoAuthCookieName = "examples_demo_user_id";

export function getDemoUser(userId: string | null | undefined): DemoUser | null {
  return demoUsers.find((user) => user.id === userId) ?? null;
}

export function getDemoUserFromRequest(request: Request): DemoUser | null {
  return getDemoUser(getCookie(request.headers.get("cookie"), demoAuthCookieName));
}

export async function demoAuthHandler(request: Request): Promise<Response> {
  if (request.method === "GET") {
    return json({ user: getDemoUserFromRequest(request), users: demoUsers });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await readJsonBody(request);

  if (body?.action === "sign-out") {
    return json(
      { user: null },
      {
        headers: {
          "Set-Cookie": serializeCookie(demoAuthCookieName, "", { maxAge: 0 }),
        },
      },
    );
  }

  if (body?.action === "sign-in" && typeof body.userId === "string") {
    const user = getDemoUser(body.userId);

    if (!user) {
      return json({ error: "Unknown demo user" }, { status: 400 });
    }

    return json(
      { user },
      {
        headers: {
          "Set-Cookie": serializeCookie(demoAuthCookieName, user.id),
        },
      },
    );
  }

  return json({ error: "Invalid auth action" }, { status: 400 });
}

export async function getDemoAuthSession(authUrl = "/api/auth"): Promise<DemoAuthResponse> {
  const response = await fetch(authUrl, { credentials: "include" });

  if (!response.ok) {
    throw new Error("Unable to load demo auth session");
  }

  return (await response.json()) as DemoAuthResponse;
}

export function signInDemoUser(userId: string, authUrl = "/api/auth"): Promise<DemoAuthResponse> {
  return updateDemoAuthSession(authUrl, { action: "sign-in", userId });
}

export function signOutDemoUser(authUrl = "/api/auth"): Promise<DemoAuthResponse> {
  return updateDemoAuthSession(authUrl, { action: "sign-out" });
}

function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

function serializeCookie(name: string, value: string, options: { maxAge?: number } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", "SameSite=Lax"];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  return parts.join("; ");
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function updateDemoAuthSession(
  authUrl: string,
  body: { action: "sign-in"; userId: string } | { action: "sign-out" },
) {
  const response = await fetch(authUrl, {
    body: JSON.stringify(body),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to update demo auth session");
  }

  return (await response.json()) as DemoAuthResponse;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  return Response.json(data, {
    ...init,
    headers,
  });
}
