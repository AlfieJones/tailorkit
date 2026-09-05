const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const teamLabel = /^[a-z0-9][a-z0-9-]{8}[a-z0-9]$/u;
const assetPath = new RegExp(`^/p/(${uuid})/a/(${uuid})/d/(${uuid})/client\\.js$`, "u");
const maxAssetBytes = 1024 * 1024;

function failure(status: number) {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

function requestIdentity(url: URL, domain: string) {
  const suffix = `.${domain}`;
  if (!url.hostname.endsWith(suffix) || url.search || url.port) {
    return;
  }
  const publicTeamId = url.hostname.slice(0, -suffix.length);
  const match = assetPath.exec(url.pathname);
  if (!teamLabel.test(publicTeamId) || !match) {
    return;
  }
  const [, projectId, appId, deploymentId] = match;
  return {
    key: `teams/${publicTeamId}/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`,
  };
}

function assetHeaders(object: R2Object) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/javascript; charset=utf-8");
  headers.set("Content-Length", String(object.size));
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const identity = requestIdentity(url, env.ASSET_DOMAIN);
    if (!identity) {
      return failure(404);
    }
    if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
      return failure(405);
    }
    if (url.protocol !== "https:") {
      return failure(400);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Cache-Control": "no-store",
        },
      });
    }

    try {
      if (request.method === "HEAD") {
        const object = await env.ASSETS.head(identity.key);
        if (!object || object.size < 1 || object.size > maxAssetBytes) {
          return failure(404);
        }
        return new Response(null, { headers: assetHeaders(object) });
      }
      const object = await env.ASSETS.get(identity.key);
      if (!object || object.size < 1 || object.size > maxAssetBytes) {
        return failure(404);
      }
      return new Response(object.body, { headers: assetHeaders(object) });
    } catch {
      console.error(JSON.stringify({ message: "Asset delivery failed", hostname: url.hostname }));
      return failure(503);
    }
  },
} satisfies ExportedHandler<Env>;
