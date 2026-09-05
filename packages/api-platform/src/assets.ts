import type { Storage } from "@tailorkit/storage";

const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const teamIdPattern = /^[a-z0-9][a-z0-9-]{12}[a-z0-9]$/u;
const uuidPattern = new RegExp(`^${uuid}$`, "u");
const maxAssetBytes = 1024 * 1024;

function failure(status: number) {
  return new Response(null, {
    status,
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
  });
}

function assetKey(request: Request) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/assets") {
    return;
  }
  const keys = [...url.searchParams.keys()];
  if (keys.length !== 4 || new Set(keys).size !== 4) {
    return;
  }
  const teamId = url.searchParams.get("team");
  const projectId = url.searchParams.get("project");
  const appId = url.searchParams.get("app");
  const deploymentId = url.searchParams.get("deployment");
  if (
    !teamId ||
    !teamIdPattern.test(teamId) ||
    !projectId ||
    !uuidPattern.test(projectId) ||
    !appId ||
    !uuidPattern.test(appId) ||
    !deploymentId ||
    !uuidPattern.test(deploymentId)
  ) {
    return;
  }
  return `teams/${teamId}/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`;
}

function responseHeaders(input: { contentLength?: number; etag?: string }) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Security-Policy": "default-src 'none'; sandbox",
    "Content-Type": "application/javascript; charset=utf-8",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  if (input.contentLength !== undefined) {
    headers.set("Content-Length", String(input.contentLength));
  }
  if (input.etag) {
    headers.set("ETag", input.etag);
  }
  return headers;
}

function isNotFound(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }
  const value = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    value.name === "NoSuchKey" ||
    value.name === "NotFound" ||
    value.$metadata?.httpStatusCode === 404
  );
}

export async function handleAssetRequest(
  request: Request,
  storage: Storage | null,
): Promise<Response> {
  const key = assetKey(request);
  if (!key) {
    return failure(404);
  }
  if (!storage) {
    return failure(503);
  }
  if (!new Set(["GET", "HEAD", "OPTIONS"]).has(request.method)) {
    return failure(405);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const object = await storage.head({ key });
    if (
      object.contentLength === undefined ||
      object.contentLength < 1 ||
      object.contentLength > maxAssetBytes
    ) {
      return failure(404);
    }
    const headers = responseHeaders(object);
    if (request.method === "HEAD") {
      return new Response(null, { headers });
    }
    const download = await storage.createDownloadUrl({ key, expiresInSeconds: 60 });
    const upstream = await fetch(download.url, { redirect: "error" });
    if (!upstream.ok) {
      return failure(upstream.status === 404 ? 404 : 503);
    }
    return new Response(upstream.body, { headers });
  } catch (error) {
    return failure(isNotFound(error) ? 404 : 503);
  }
}
