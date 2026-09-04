const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const teamLabel = /^[a-z0-9]{10}$/u;
const assetPath = new RegExp(`^/p/${uuid}/d/${uuid}/client\\.js$`, "u");
const maxAssetBytes = 1024 * 1024;

function validAssetUrl(url: URL, domain: string) {
  const suffix = `.${domain}`;
  return (
    url.hostname.endsWith(suffix) &&
    teamLabel.test(url.hostname.slice(0, -suffix.length)) &&
    assetPath.test(url.pathname) &&
    !url.search &&
    !url.port
  );
}

function failure(status: number) {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
  });
}

async function readBounded(response: Response, limit: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!response.body) {
    throw new Error("Missing body");
  }
  const reader = response.body.getReader();
  const bytes = new Uint8Array(limit);
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      if (length + value.byteLength > limit) {
        throw new Error("Body too large");
      }
      bytes.set(value, length);
      length += value.byteLength;
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  return bytes.slice(0, length);
}

function isAsset(
  value: unknown,
): value is { url: string; checksum: string; contentLength: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof value.url === "string" &&
    "checksum" in value &&
    typeof value.checksum === "string" &&
    /^[a-f0-9]{64}$/u.test(value.checksum) &&
    "contentLength" in value &&
    typeof value.contentLength === "number" &&
    Number.isInteger(value.contentLength) &&
    value.contentLength > 0 &&
    value.contentLength <= maxAssetBytes
  );
}

async function loadVerifiedBundle(
  url: URL,
  asset: { url: string; checksum: string; contentLength: number },
  ctx: ExecutionContext,
): Promise<Response> {
  const sourceUrl = new URL(asset.url);
  if (sourceUrl.protocol !== "https:" || sourceUrl.username || sourceUrl.password) {
    return failure(502);
  }
  const cacheKey = new Request(url.toString());
  const cached = await caches.default.match(cacheKey);
  if (cached?.headers.get("ETag") === `"${asset.checksum}"`) {
    return cached;
  }
  const upstream = await fetch(sourceUrl, {
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (upstream.status !== 200) {
    return failure(502);
  }
  // Bundles are capped at 1 MiB. Verify bytes, not merely mutable object metadata.
  const bytes = await readBounded(upstream, asset.contentLength);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const checksum = Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (bytes.byteLength !== asset.contentLength || checksum !== asset.checksum) {
    return failure(502);
  }
  const response = new Response(bytes, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      ETag: `"${checksum}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
  ctx.waitUntil(
    caches.default.put(cacheKey, response.clone()).catch(() => {
      console.error(JSON.stringify({ message: "Asset cache write failed" }));
    }),
  );
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!validAssetUrl(url, env.ASSET_DOMAIN)) {
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
      if (!env.ASSET_GATEWAY_SECRET || env.ASSET_GATEWAY_SECRET.length < 32) {
        return failure(503);
      }
      const origin = new URL(env.PLATFORM_ORIGIN);
      if (origin.protocol !== "https:" || origin.hostname.endsWith(".invalid")) {
        return failure(503);
      }
      const resolver = new URL("/api/asset-resolve", origin);
      resolver.searchParams.set("hostname", url.hostname);
      resolver.searchParams.set("path", url.pathname);
      // Always authorize before reading cache. Never forward browser credentials or headers.
      const resolved = await fetch(resolver, {
        headers: { Authorization: `Bearer ${env.ASSET_GATEWAY_SECRET}` },
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!resolved.ok) {
        return failure(resolved.status === 404 ? 404 : 503);
      }
      const asset: unknown = JSON.parse(
        new TextDecoder().decode(await readBounded(resolved, 16_384)),
      );
      if (!isAsset(asset)) {
        return failure(502);
      }
      const response = await loadVerifiedBundle(url, asset, ctx);
      if (!response.ok) {
        return response;
      }
      const headers = new Headers(response.headers);
      // Edge bytes are cached internally; downstream caches must not bypass takedowns.
      headers.set("Cache-Control", "no-store");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cross-Origin-Resource-Policy", "cross-origin");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "no-referrer");
      headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
      return new Response(request.method === "HEAD" ? null : response.body, { headers });
    } catch {
      // Never log signed storage URLs or service credentials.
      console.error(JSON.stringify({ message: "Asset delivery failed", hostname: url.hostname }));
      return failure(503);
    }
  },
} satisfies ExportedHandler<Env>;
