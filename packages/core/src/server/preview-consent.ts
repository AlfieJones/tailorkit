import { previewAccept, previewInvitation } from "@tailorkit/client-platform/client";
import type { Client as PlatformClient } from "@tailorkit/client-platform/client/client/index";
import { approvalStyles, escapeHtml } from "./cli-auth-page";

export const previewCookieName = "tailorkit_preview_grants";

export function readPreviewGrantIds(request: Request): string[] {
  const pair = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${previewCookieName}=`));
  if (!pair) {
    return [];
  }
  try {
    const ids = JSON.parse(decodeURIComponent(pair.slice(previewCookieName.length + 1))) as unknown;
    return Array.isArray(ids)
      ? ids
          .filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{43}$/u.test(id))
          .slice(-20)
      : [];
  } catch {
    return [];
  }
}

interface ConsentOptions {
  request: Request;
  shareId: string;
  basePath: string;
  returnPath: string;
  signInPath?: `/${string}`;
  platform: PlatformClient;
  platformHeaders: Record<string, string>;
  authenticate: (ctx: {
    request: Request;
  }) => Promise<{ scopeId: string } | null> | { scopeId: string } | null;
}

const headers = { "cache-control": "no-store", "referrer-policy": "no-referrer" };

export async function handlePreviewConsent(options: ConsentOptions): Promise<Response> {
  const {
    request,
    shareId,
    basePath,
    returnPath,
    signInPath,
    platform,
    platformHeaders,
    authenticate,
  } = options;
  const url = new URL(request.url);
  if (!/^[A-Za-z0-9_-]{43}$/u.test(shareId)) {
    return new Response("Preview unavailable", { status: 404, headers });
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...headers, allow: "GET, POST" },
    });
  }
  if (request.method === "POST") {
    if (
      request.headers.get("origin") !== url.origin ||
      request.headers.get("sec-fetch-site") === "cross-site"
    ) {
      return new Response("Cross-origin preview acceptance is forbidden", { status: 403, headers });
    }
    const form = await request.formData();
    const intent = form.get("intent");
    if (intent === "cancel") {
      return new Response(null, { status: 303, headers: { ...headers, location: returnPath } });
    }
    if (intent !== "accept") {
      return new Response("Invalid consent action", { status: 400, headers });
    }
  }
  const viewer = await authenticate({ request });
  if (!viewer) {
    if (signInPath) {
      const signIn = new URL(signInPath, url);
      if (signIn.origin !== url.origin) {
        throw new Error("Sign-in path must be same-origin.");
      }
      signIn.searchParams.set("returnTo", `${url.pathname}${url.search}`);
      return new Response(null, { status: 302, headers: { ...headers, location: signIn.href } });
    }
    return html(
      "Sign in required",
      "Sign in to your host app before accepting this preview.",
      "",
      401,
    );
  }
  if (request.method === "POST") {
    try {
      const result = await previewAccept({
        body: { scopeId: viewer.scopeId },
        path: { shareId },
        client: platform,
        headers: platformHeaders,
        throwOnError: true,
      });
      const data = "data" in result ? result.data : result;
      const ids = [...new Set([...readPreviewGrantIds(request), data.grantId])].slice(-20);
      const cookie = `${previewCookieName}=${encodeURIComponent(JSON.stringify(ids))}; Path=${basePath}; Max-Age=86400; HttpOnly; SameSite=Lax${url.protocol === "https:" ? "; Secure" : ""}`;
      return new Response(null, {
        status: 303,
        headers: { ...headers, location: returnPath, "set-cookie": cookie },
      });
    } catch (error) {
      return previewErrorResponse(error);
    }
  }
  try {
    const result = await previewInvitation({
      path: { shareId },
      client: platform,
      headers: platformHeaders,
      throwOnError: true,
    });
    const data = "data" in result ? result.data : result;
    const appName = escapeHtml(data.appName);
    return html(
      `Preview ${appName}`,
      `${appName} will run using your host context and your existing action permissions.`,
      `<form method="post"><div class="actions"><button class="button primary" name="intent" value="accept" type="submit">Accept preview</button><button class="button secondary" name="intent" value="cancel" type="submit">Cancel</button></div></form>`,
    );
  } catch (error) {
    return previewErrorResponse(error);
  }
}

function previewErrorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error);
  return /storage is unavailable|SERVICE_UNAVAILABLE/u.test(message)
    ? new Response("Preview storage is unavailable: configure KV.", { status: 503, headers })
    : new Response("Preview unavailable", { status: 404, headers });
}

function html(title: string, description: string, controls: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>${approvalStyles}</style></head><body><main class="page"><section class="card"><h1>${title}</h1><p class="description">${description}</p>${controls}</section><p class="footer-link">Powered by <a href="https://tailorkit.dev/home">TailorKit</a></p></main></body></html>`,
    { status, headers: { ...headers, "content-type": "text/html; charset=utf-8" } },
  );
}
