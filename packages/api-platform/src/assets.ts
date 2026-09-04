import { db } from "@tailorkit/db";
import { env, getBaseUrl } from "@tailorkit/env/server";
import { getStorage } from "@tailorkit/storage";
import { signAssetGrant, verifyAssetGrant } from "./asset-token";

// Only the authenticated, scope-filtered registry issues these capabilities.
// Neither a bucket URL nor a platform credential is exposed to the browser.
export function withClientPath<
  T extends {
    id: string;
    projectId: string;
    currentDeployment: { id: string; status: string } | null;
  },
>(app: T): T & { clientPath?: string } {
  if (app.currentDeployment?.status !== "published") {
    return app;
  }
  const token = signAssetGrant(
    { projectId: app.projectId, appId: app.id, deploymentId: app.currentDeployment.id },
    env.AUTH_SECRET ?? "",
  );
  return { ...app, clientPath: new URL(`/api/assets/${token}/client.js`, getBaseUrl()).href };
}

const headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, HEAD, OPTIONS",
  "cache-control": "private, no-store",
  "content-security-policy": "default-src 'none'; sandbox",
  "cross-origin-resource-policy": "cross-origin",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};

async function readAsset(url: string, contentLength: number) {
  const upstream = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (!upstream.ok || !upstream.body) {
    throw new Error("Asset unavailable");
  }
  const reader = upstream.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > contentLength || size > 1024 * 1024) {
      await reader.cancel();
      throw new Error("Invalid asset size");
    }
    chunks.push(value);
  }
  if (size !== contentLength) {
    throw new Error("Invalid asset size");
  }
  return Buffer.concat(chunks);
}

export async function handleAssetRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, {
      status: 405,
      headers: { ...headers, allow: "GET, HEAD, OPTIONS" },
    });
  }
  const match = /^\/api\/assets\/([A-Za-z0-9_.-]+)\/client\.js$/u.exec(
    new URL(request.url).pathname,
  );
  const grant = match?.[1] && verifyAssetGrant(match[1], env.AUTH_SECRET ?? "");
  if (!grant) {
    return new Response("Not found", { status: 404, headers });
  }
  try {
    const app = await db.query.app.findFirst({
      where: { id: grant.appId, projectId: grant.projectId },
    });
    if (!app) {
      return new Response("Not found", { status: 404, headers });
    }
    const deployment = await db.query.appDeployment.findFirst({
      where: { id: grant.deploymentId, appId: app.id, status: "published" },
    });
    if (!deployment?.clientEntryFileId) {
      return new Response("Not found", { status: 404, headers });
    }
    const file = await db.query.appDeploymentFile.findFirst({
      where: {
        id: deployment.clientEntryFileId,
        appDeploymentId: deployment.id,
        status: "verified",
      },
    });
    const prefix = `projects/${app.projectId}/apps/${app.id}/deployments/${deployment.id}/files/`;
    if (
      !file ||
      !file.objectKey.startsWith(prefix) ||
      file.contentType !== "application/javascript" ||
      file.contentLength > 1024 * 1024
    ) {
      return new Response("Not found", { status: 404, headers });
    }
    const storage = getStorage();
    if (!storage) {
      throw new Error("Storage unavailable");
    }
    const download = await storage.createDownloadUrl({ key: file.objectKey, expiresInSeconds: 60 });
    // Fetch server-side: R2 stays private and needs no browser CORS configuration.
    const bytes = await readAsset(download.url, file.contentLength);
    return new Response(request.method === "HEAD" ? null : bytes, {
      headers: {
        ...headers,
        "content-type": "application/javascript; charset=utf-8",
        "content-length": String(bytes.byteLength),
      },
    });
  } catch {
    return new Response("Asset unavailable", { status: 502, headers });
  }
}
