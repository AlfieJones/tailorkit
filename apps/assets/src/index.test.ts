import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

const path =
  "/p/22222222-2222-4222-8222-222222222222/d/44444444-4444-4444-8444-444444444444/client.js";
const url = `https://abc123def4.tailorkit.app${path}`;
const bundle = "export default 'tenant bundle';";
const env: Env = {
  ASSET_DOMAIN: "tailorkit.app",
  PLATFORM_ORIGIN: "https://tailorkit.dev",
  ASSET_GATEWAY_SECRET: "test-gateway-secret-at-least-32-characters",
};
const pending: Promise<unknown>[] = [];
const ctx = {
  waitUntil: (promise: Promise<unknown>) => pending.push(promise),
} as unknown as ExecutionContext;
const cache = new Map<string, Response>();
const upstream = vi.fn<typeof fetch>();
const match = vi.fn((request: Request) => Promise.resolve(cache.get(request.url)?.clone()));
const put = vi.fn((request: Request, response: Response) => {
  cache.set(request.url, response);
  return Promise.resolve();
});
let checksum: string;

function metadata(overrides: Record<string, unknown> = {}) {
  return Response.json({
    url: "https://private-storage.example/object?signature=private",
    checksum,
    contentLength: new TextEncoder().encode(bundle).byteLength,
    ...overrides,
  });
}

beforeEach(async () => {
  checksum = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(bundle))),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
  cache.clear();
  pending.length = 0;
  vi.clearAllMocks();
  vi.stubGlobal("fetch", upstream);
  vi.stubGlobal("caches", { default: { match, put } });
  upstream.mockReset();
});

afterEach(async () => {
  await Promise.all(pending);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("tenant asset gateway", () => {
  it("verifies bytes, hides the storage URL and never forwards browser credentials", async () => {
    upstream.mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(bundle));
    const response = await worker.fetch(
      new Request(url, {
        headers: {
          Cookie: "session=private",
          Authorization: "Bearer browser",
          Origin: "https://crm.example",
        },
      }),
      env,
      ctx,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(bundle);
    expect(response.headers.get("Location")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(upstream.mock.calls[0]?.[1]?.headers).toEqual({
      Authorization: `Bearer ${env.ASSET_GATEWAY_SECRET}`,
    });
    expect(upstream.mock.calls[1]?.[1]?.headers).toBeUndefined();
    expect(upstream.mock.calls[1]?.[1]?.redirect).toBe("manual");
    await Promise.all(pending);
    expect(put).toHaveBeenCalledOnce();
  });

  it("checks takedowns before cache hits and scopes cache keys to the tenant hostname", async () => {
    cache.set(url, new Response(bundle, { headers: { ETag: `"${checksum}"` } }));
    upstream.mockResolvedValueOnce(metadata());
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 200);
    expect(upstream).toHaveBeenCalledTimes(1);
    match.mockClear();
    upstream.mockResolvedValueOnce(new Response(null, { status: 404 }));
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 404);
    expect(match).not.toHaveBeenCalled();
    upstream.mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(bundle));
    const otherUrl = url.replace("abc123def4", "xyz123def4");
    await expect(worker.fetch(new Request(otherUrl), env, ctx)).resolves.toHaveProperty(
      "status",
      200,
    );
    expect(match.mock.calls[0]?.[0].url).toBe(otherUrl);
    expect(upstream).toHaveBeenCalledTimes(4);
  });

  it("rejects foreign hosts, prefixed/sluggable identities, malformed paths and query strings", async () => {
    for (const invalid of [
      url.replace("abc123def4", "team-abc123def4"),
      url.replace("abc123def4", "editable-slug"),
      url.replace("tailorkit.app", "tailorkit.app.evil.example"),
      url.replace("abc123def4", "nested.abc123def4"),
      `${url}?token=anything`,
      url.replace("client.js", "secret.js"),
      url.replace("22222222-2222-4222-8222-222222222222", "project-slug"),
    ]) {
      await expect(worker.fetch(new Request(invalid), env, ctx)).resolves.toHaveProperty(
        "status",
        404,
      );
    }
    expect(upstream).not.toHaveBeenCalled();
    expect(match).not.toHaveBeenCalled();
  });

  it("supports HEAD and preflight without exposing browser credentials", async () => {
    await expect(
      worker.fetch(new Request(url, { method: "POST" }), env, ctx),
    ).resolves.toHaveProperty("status", 405);
    await expect(
      worker.fetch(new Request(url.replace("https:", "http:")), env, ctx),
    ).resolves.toHaveProperty("status", 400);
    const preflight = await worker.fetch(new Request(url, { method: "OPTIONS" }), env, ctx);
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("Access-Control-Allow-Credentials")).toBeNull();
    expect(upstream).not.toHaveBeenCalled();
    upstream.mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(bundle));
    const head = await worker.fetch(new Request(url, { method: "HEAD" }), env, ctx);
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");
  });

  it("fails closed for invalid metadata, insecure sources and corrupted bytes", async () => {
    for (const overrides of [
      { contentLength: 1024 * 1024 + 1 },
      { checksum: "bad" },
      { url: "http://private-storage.example/object" },
      { url: "https://user:pass@private-storage.example/object" },
    ]) {
      upstream.mockResolvedValueOnce(metadata(overrides));
      await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 502);
    }
    upstream.mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response("wrong"));
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 502);
    expect(put).not.toHaveBeenCalled();
  });

  it("bounds streamed bodies and never logs private storage URLs or credentials", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    upstream
      .mockResolvedValueOnce(metadata())
      .mockResolvedValueOnce(new Response(bundle.repeat(2)));
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 503);
    expect(put).not.toHaveBeenCalled();
    expect(JSON.stringify(log.mock.calls)).not.toContain("signature");
    expect(JSON.stringify(log.mock.calls)).not.toContain(env.ASSET_GATEWAY_SECRET);
  });

  it("fails closed when service configuration or the resolver is unavailable", async () => {
    await expect(
      worker.fetch(new Request(url), { ...env, ASSET_GATEWAY_SECRET: "" }, ctx),
    ).resolves.toHaveProperty("status", 503);
    expect(upstream).not.toHaveBeenCalled();
    upstream.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 503);
    expect(match).not.toHaveBeenCalled();
  });

  it("does not follow resolver or storage redirects", async () => {
    upstream.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { Location: "https://elsewhere.example" } }),
    );
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 503);
    expect(upstream.mock.calls[0]?.[1]?.redirect).toBe("manual");
    upstream
      .mockResolvedValueOnce(metadata())
      .mockResolvedValueOnce(
        new Response(null, { status: 302, headers: { Location: "https://elsewhere.example" } }),
      );
    await expect(worker.fetch(new Request(url), env, ctx)).resolves.toHaveProperty("status", 502);
    expect(upstream).toHaveBeenCalledTimes(3);
    expect(put).not.toHaveBeenCalled();
  });
});
