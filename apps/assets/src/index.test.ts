import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "33333333-3333-4333-8333-333333333333";
const deploymentId = "44444444-4444-4444-8444-444444444444";
const path = `/p/${projectId}/a/${appId}/d/${deploymentId}/client.js`;
const url = `https://abc123def4.tailorkit.app${path}`;
const key = `teams/abc123def4/projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`;
const bundle = "export default 'tenant bundle';";
const get = vi.fn();
const head = vi.fn();
const env = { ASSET_DOMAIN: "tailorkit.app", ASSETS: { get, head } } as unknown as Env;

function object(body = bundle) {
  return {
    body: new Response(body).body,
    size: new TextEncoder().encode(body).byteLength,
    httpEtag: '"etag"',
    writeHttpMetadata: vi.fn(),
  };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("tenant asset gateway", () => {
  it("serves an immutable bundle directly from its team-scoped R2 key", async () => {
    get.mockResolvedValueOnce(object());
    const response = await worker.fetch(new Request(url), env);
    expect(get).toHaveBeenCalledWith(key);
    expect(await response.text()).toBe(bundle);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("Content-Type")).toBe("application/javascript; charset=utf-8");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("uses the hostname tenant ID as part of the storage namespace", async () => {
    get.mockResolvedValueOnce(object());
    const otherUrl = url.replace("abc123def4", "xyz123def4");
    await worker.fetch(new Request(otherUrl), env);
    expect(get).toHaveBeenCalledWith(key.replace("abc123def4", "xyz123def4"));
  });

  it.each(["team-abcde", "a--------z", "0-123456-9"])(
    "serves bundles for hyphenated team ID %s",
    async (publicId) => {
      get.mockResolvedValueOnce(object());
      const response = await worker.fetch(new Request(url.replace("abc123def4", publicId)), env);
      expect(response.status).toBe(200);
      expect(get).toHaveBeenCalledWith(key.replace("abc123def4", publicId));
      expect(await response.text()).toBe(bundle);
    },
  );

  it("rejects foreign hosts, slugs, malformed paths and query strings before R2", async () => {
    for (const invalid of [
      url.replace("abc123def4", "team-abc123def4"),
      url.replace("abc123def4", "editable-slug"),
      url.replace("abc123def4", "-bc123def4"),
      url.replace("abc123def4", "abc123def-"),
      url.replace("abc123def4", "abc_23def4"),
      url.replace("tailorkit.app", "tailorkit.app.evil.example"),
      url.replace("abc123def4", "nested.abc123def4"),
      `${url}?token=anything`,
      url.replace("client.js", "secret.js"),
      url.replace(appId, "app-slug"),
    ]) {
      await expect(worker.fetch(new Request(invalid), env)).resolves.toHaveProperty("status", 404);
    }
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it("supports HEAD and preflight without reading bundle bodies", async () => {
    await expect(worker.fetch(new Request(url, { method: "POST" }), env)).resolves.toHaveProperty(
      "status",
      405,
    );
    await expect(
      worker.fetch(new Request(url.replace("https:", "http:")), env),
    ).resolves.toHaveProperty("status", 400);
    const preflight = await worker.fetch(new Request(url, { method: "OPTIONS" }), env);
    expect(preflight.status).toBe(204);
    expect(get).not.toHaveBeenCalled();
    head.mockResolvedValueOnce(object());
    const response = await worker.fetch(new Request(url, { method: "HEAD" }), env);
    expect(response.status).toBe(200);
    expect(head).toHaveBeenCalledWith(key);
    expect(await response.text()).toBe("");
  });

  it("hides missing or oversized objects and fails safely on R2 errors", async () => {
    get.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...object(), size: 1024 * 1024 + 1 });
    await expect(worker.fetch(new Request(url), env)).resolves.toHaveProperty("status", 404);
    await expect(worker.fetch(new Request(url), env)).resolves.toHaveProperty("status", 404);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    get.mockRejectedValueOnce(new Error("private storage detail"));
    await expect(worker.fetch(new Request(url), env)).resolves.toHaveProperty("status", 503);
    expect(JSON.stringify(log.mock.calls)).not.toContain("private storage detail");
  });
});
