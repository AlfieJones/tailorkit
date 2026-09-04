import { beforeEach, describe, expect, it, vi } from "vitest";
import { signAssetGrant, verifyAssetGrant } from "./asset-token";

const state = vi.hoisted(() => ({
  app: vi.fn(),
  deployment: vi.fn(),
  file: vi.fn(),
  download: vi.fn(),
}));
vi.mock("@tailorkit/db", () => ({
  db: {
    query: {
      app: { findFirst: state.app },
      appDeployment: { findFirst: state.deployment },
      appDeploymentFile: { findFirst: state.file },
    },
  },
}));
vi.mock("@tailorkit/storage", () => ({
  getStorage: () => ({ createDownloadUrl: state.download }),
}));
const { handleAssetRequest, withClientPath } = await import("./assets");
const secret = "test-auth-secret-test-auth-secret";
const ids = {
  projectId: "11111111-1111-4111-8111-111111111111",
  appId: "22222222-2222-4222-8222-222222222222",
  deploymentId: "33333333-3333-4333-8333-333333333333",
};
const key = `projects/${ids.projectId}/apps/${ids.appId}/deployments/${ids.deploymentId}/files/client.js`;
function request(token = signAssetGrant(ids, secret), method = "GET") {
  return new Request(`https://tailorkit.dev/api/assets/${token}/client.js`, { method });
}
describe("hosted app assets", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    state.app.mockResolvedValue({ id: ids.appId, projectId: ids.projectId });
    state.deployment.mockResolvedValue({ id: ids.deploymentId, clientEntryFileId: "file" });
    state.file.mockResolvedValue({
      objectKey: key,
      contentType: "application/javascript",
      contentLength: 4,
    });
    state.download.mockResolvedValue({ url: "https://private-storage.test/signed", key });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("code"));
  });
  it("signs a bounded grant and rejects expiry, tampering and another secret", () => {
    const token = signAssetGrant(ids, secret, 1000);
    expect(verifyAssetGrant(token, secret, 1000)).toMatchObject(ids);
    expect(verifyAssetGrant(token, secret, 1000 + 86_400_000)).toBeNull();
    expect(verifyAssetGrant(`${token}x`, secret, 1000)).toBeNull();
    expect(verifyAssetGrant(token, "different-secret-different-secret", 1000)).toBeNull();
    expect(verifyAssetGrant(`${token}.extra`, secret, 1000)).toBeNull();
  });
  it("adds a platform URL only for published deployments", () => {
    const app = { id: ids.appId, projectId: ids.projectId, currentDeployment: null };
    expect(withClientPath(app).clientPath).toBeUndefined();
    expect(
      withClientPath({ ...app, currentDeployment: { id: ids.deploymentId, status: "uploading" } })
        .clientPath,
    ).toBeUndefined();
    expect(
      withClientPath({ ...app, currentDeployment: { id: ids.deploymentId, status: "published" } })
        .clientPath,
    ).toMatch(/^http:\/\/localhost:3000\/api\/assets\/.+\/client.js$/u);
  });
  it("does not touch storage for an invalid capability", async () => {
    await expect(handleAssetRequest(request("invalid"))).resolves.toHaveProperty("status", 404);
    expect(state.app).not.toHaveBeenCalled();
    expect(state.download).not.toHaveBeenCalled();
  });
  it("serves verified JavaScript without leaking credentials or redirecting", async () => {
    const response = await handleAssetRequest(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("code");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("location")).toBeNull();
    expect(state.app).toHaveBeenCalledWith({ where: { id: ids.appId, projectId: ids.projectId } });
    expect(state.deployment).toHaveBeenCalledWith({
      where: { id: ids.deploymentId, appId: ids.appId, status: "published" },
    });
    expect(state.file).toHaveBeenCalledWith({
      where: { id: "file", appDeploymentId: ids.deploymentId, status: "verified" },
    });
  });
  it("rejects deleted apps, unpublished deployments and unverified files", async () => {
    for (const lookup of [state.app, state.deployment, state.file]) {
      lookup.mockResolvedValueOnce(null);
      await expect(handleAssetRequest(request())).resolves.toHaveProperty("status", 404);
    }
    expect(state.download).not.toHaveBeenCalled();
  });
  it("rejects cross-project keys and oversized or truncated storage responses", async () => {
    state.file.mockResolvedValueOnce({
      objectKey: "projects/other/client.js",
      contentType: "application/javascript",
      contentLength: 4,
    });
    await expect(handleAssetRequest(request())).resolves.toHaveProperty("status", 404);
    vi.mocked(fetch).mockResolvedValueOnce(new Response("oversized"));
    await expect(handleAssetRequest(request())).resolves.toHaveProperty("status", 502);
    vi.mocked(fetch).mockResolvedValueOnce(new Response("x"));
    await expect(handleAssetRequest(request())).resolves.toHaveProperty("status", 502);
  });
  it("supports preflight and HEAD, rejects writes", async () => {
    await expect(handleAssetRequest(request("unused", "OPTIONS"))).resolves.toHaveProperty(
      "status",
      204,
    );
    await expect(handleAssetRequest(request("unused", "POST"))).resolves.toHaveProperty(
      "status",
      405,
    );
    const response = await handleAssetRequest(request(undefined, "HEAD"));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});
