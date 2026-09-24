import { previewAccept, previewInvitation } from "@tailorkit/client-platform/client";
import type { Client as PlatformClient } from "@tailorkit/client-platform/client/client/index";
import { z } from "zod";
import { approvalStyles, escapeHtml } from "./cli-auth-page";

export const previewCookieName = "tailorkit_preview_grants";
const previewCsrfCookieName = "tailorkit_preview_csrf";
const grantIdSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/u);
const grantIdsSchema = z.array(grantIdSchema).max(20);
const consentIntentSchema = z.enum(["accept", "cancel"]);

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
    return grantIdsSchema.parse(
      JSON.parse(decodeURIComponent(pair.slice(previewCookieName.length + 1))) as unknown,
    );
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
  if (!grantIdSchema.safeParse(shareId).success) {
    return new Response("Preview unavailable", { status: 404, headers });
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...headers, allow: "GET, POST" },
    });
  }
  if (request.method === "POST") {
    const origin = request.headers.get("origin");
    const isOpaqueOrigin = origin === "null";
    if (
      (!isOpaqueOrigin && origin !== url.origin) ||
      (!isOpaqueOrigin && request.headers.get("sec-fetch-site") === "cross-site")
    ) {
      return new Response("Cross-origin preview acceptance is forbidden", { status: 403, headers });
    }
    const form = await request.formData();
    if (isOpaqueOrigin) {
      const submittedToken = form.get("csrfToken");
      const cookieToken = readCookie(request, previewCsrfCookieName);
      if (typeof submittedToken !== "string" || !cookieToken || submittedToken !== cookieToken) {
        return new Response("Cross-origin preview acceptance is forbidden", {
          status: 403,
          headers,
        });
      }
    }
    const intent = consentIntentSchema.safeParse(form.get("intent"));
    if (intent.success && intent.data === "cancel") {
      return new Response(null, { status: 303, headers: { ...headers, location: returnPath } });
    }
    if (!intent.success || intent.data !== "accept") {
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
    const csrfToken = createCsrfToken();
    const csrfCookie = `${previewCsrfCookieName}=${csrfToken}; Path=${basePath}; Max-Age=300; HttpOnly; SameSite=Strict${url.protocol === "https:" ? "; Secure" : ""}`;
    return html(
      `Preview ${appName}`,
      "After you accept, this preview is available only in this browser.",
      `<aside class="warning" role="note" aria-labelledby="preview-warning-title"><span class="warning-icon" aria-hidden="true">⚠</span><div><h2 class="warning-title" id="preview-warning-title">Untrusted content</h2><p class="warning-description">Only accept previews from trusted developers.</p></div></aside><form method="post"><input type="hidden" name="csrfToken" value="${csrfToken}"><div class="actions"><button class="button primary" name="intent" value="accept" type="submit">Accept preview</button><button class="button secondary" name="intent" value="cancel" type="submit">Cancel</button></div></form>`,
      200,
      { "set-cookie": csrfCookie },
    );
  } catch (error) {
    return previewErrorResponse(error);
  }
}

function previewErrorResponse(error: unknown): Response {
  const details = error !== null && typeof error === "object" ? error : null;
  const code = details && "code" in details ? details.code : undefined;
  let message = "";
  if (error instanceof Error) {
    message = error.message;
  } else if (details && "message" in details && typeof details.message === "string") {
    message = details.message;
  } else if (typeof error === "string") {
    message = error;
  }
  return code === "SERVICE_UNAVAILABLE" ||
    /storage is unavailable|SERVICE_UNAVAILABLE/u.test(message)
    ? new Response("Preview storage is unavailable: configure KV.", { status: 503, headers })
    : new Response("Preview unavailable", { status: 404, headers });
}

function html(
  title: string,
  description: string,
  controls: string,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>${approvalStyles}</style></head><body><main class="page"><section class="card"><h1>${title}</h1><p class="description">${description}</p>${controls}</section><p class="footer-link">Powered by <a href="https://tailorkit.dev/home">TailorKit</a></p></main></body></html>`,
    {
      status,
      headers: { ...headers, ...extraHeaders, "content-type": "text/html; charset=utf-8" },
    },
  );
}

function createCsrfToken(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!cookie) {
    return null;
  }
  return cookie.slice(name.length + 1);
}
