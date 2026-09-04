import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { organization } from "@tailorkit/db/schema/auth";
import { project } from "@tailorkit/db/schema/project";
import { app, appDeployment, appDeploymentFile } from "@tailorkit/db/schema/apps";
import { createTestDb } from "./test/pglite";

const state = vi.hoisted(() => ({
  db: undefined as unknown,
  download: vi.fn(),
  env: {
    ASSET_DOMAIN: "tailorkit.app",
    ASSET_GATEWAY_SECRET: "test-gateway-secret-test-gateway-secret",
    ASSET_BLOCKED_TEAM_IDS: "",
    ASSET_BLOCKED_DEPLOYMENT_IDS: "",
  },
}));
vi.mock("@tailorkit/db", () => ({
  get db() {
    return state.db;
  },
}));
vi.mock("@tailorkit/env/server", () => ({ env: state.env }));
vi.mock("@tailorkit/storage/storage", () => ({
  getStorage: () => ({ createDownloadUrl: state.download }),
}));
const { resolveAsset } = await import("./assets");
const { withAppAssetUrl } = await import("./asset-url");

const orgId = "11111111-1111-4111-8111-111111111111";
const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "33333333-3333-4333-8333-333333333333";
const deploymentId = "44444444-4444-4444-8444-444444444444";
const fileId = "55555555-5555-4555-8555-555555555555";
const key = `projects/${projectId}/apps/${appId}/deployments/${deploymentId}/files/client.js`;
function request(
  hostname = "abc123def4.tailorkit.app",
  path = `/p/${projectId}/d/${deploymentId}/client.js`,
  secret = state.env.ASSET_GATEWAY_SECRET,
) {
  const url = new URL("https://tailorkit.dev/api/asset-resolve");
  url.searchParams.set("hostname", hostname);
  url.searchParams.set("path", path);
  return new Request(url, { headers: { authorization: `Bearer ${secret}` } });
}

describe("tenant asset resolution", () => {
  let fixture: Awaited<ReturnType<typeof createTestDb>>;
  beforeEach(async () => {
    fixture = await createTestDb();
    state.db = fixture.db;
    state.env.ASSET_BLOCKED_TEAM_IDS = "";
    state.env.ASSET_BLOCKED_DEPLOYMENT_IDS = "";
    state.download.mockReset().mockResolvedValue({ url: "https://private.example/signed" });
    await fixture.db.insert(organization).values({
      id: orgId,
      publicId: "abc123def4",
      name: "Team",
      slug: "editable-team",
      createdAt: new Date(),
    });
    await fixture.db.insert(organization).values({
      id: "88888888-8888-4888-8888-888888888888",
      publicId: "otherteam0",
      name: "Other tenant",
      slug: "other-tenant",
      createdAt: new Date(),
    });
    await fixture.db
      .insert(project)
      .values({ id: projectId, organizationId: orgId, name: "Project", slug: "editable-project" });
    await fixture.db
      .insert(app)
      .values({ id: appId, publicId: "app0000001", projectId, scopeId: "workspace", name: "App" });
    await fixture.db
      .insert(appDeployment)
      .values({ id: deploymentId, publicId: "deploy0001", appId, status: "published" });
    await fixture.db.insert(appDeploymentFile).values({
      id: fileId,
      appDeploymentId: deploymentId,
      objectKey: key,
      contentType: "application/javascript",
      encoding: "utf-8",
      contentLength: 4,
      checksum: "a".repeat(64),
      status: "verified",
    });
    await fixture.db
      .update(appDeployment)
      .set({ clientEntryFileId: fileId })
      .where(eq(appDeployment.id, deploymentId));
  });
  afterEach(async () => {
    await fixture.client.close();
  });

  it("resolves the correct team and preserves URLs after team and project renames", async () => {
    const deployment = await fixture.db.query.appDeployment.findFirst({
      where: { id: deploymentId },
    });
    if (!deployment) {
      throw new Error("Missing deployment");
    }
    const before = withAppAssetUrl({ currentDeployment: deployment }, "abc123def4", projectId);
    expect(before.clientPath).toBe(
      `https://abc123def4.tailorkit.app/p/${projectId}/d/${deploymentId}/client.js`,
    );
    await fixture.db
      .update(organization)
      .set({ name: "Renamed", slug: "renamed-team" })
      .where(eq(organization.id, orgId));
    await fixture.db
      .update(project)
      .set({ name: "Renamed", slug: "renamed-project" })
      .where(eq(project.id, projectId));
    const renamed = await fixture.db.query.organization.findFirst({ where: { id: orgId } });
    expect(renamed?.publicId).toBe("abc123def4");
    expect(
      withAppAssetUrl({ currentDeployment: deployment }, renamed?.publicId ?? "", projectId),
    ).toEqual(before);
    const response = await resolveAsset(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(state.download).toHaveBeenCalledWith({ key, expiresInSeconds: 60 });
  });
  it("rejects another tenant, legacy prefixes, slugs, path traversal and missing service authentication", async () => {
    for (const hostname of [
      "otherteam0.tailorkit.app",
      "team-abc123def4.tailorkit.app",
      "editable-team.tailorkit.app",
      "abc123def4.tailorkit.app.evil.test",
      "abc123def4.extra.tailorkit.app",
    ]) {
      await expect(resolveAsset(request(hostname))).resolves.toHaveProperty("status", 404);
    }
    await expect(
      resolveAsset(request("abc123def4.tailorkit.app", `/p/${orgId}/d/${deploymentId}/client.js`)),
    ).resolves.toHaveProperty("status", 404);
    await expect(
      resolveAsset(request("abc123def4.tailorkit.app", "/../client.js")),
    ).resolves.toHaveProperty("status", 404);
    await expect(
      resolveAsset(
        request("abc123def4.tailorkit.app", `/p/${projectId}/d/${deploymentId}/client.js`, "wrong"),
      ),
    ).resolves.toHaveProperty("status", 404);
    expect(state.download).not.toHaveBeenCalled();
  });
  it("enforces tenant and deployment takedowns and published/verified status", async () => {
    state.env.ASSET_BLOCKED_TEAM_IDS = "abc123def4";
    await expect(resolveAsset(request())).resolves.toHaveProperty("status", 404);
    state.env.ASSET_BLOCKED_TEAM_IDS = "";
    state.env.ASSET_BLOCKED_DEPLOYMENT_IDS = deploymentId;
    await expect(resolveAsset(request())).resolves.toHaveProperty("status", 404);
    state.env.ASSET_BLOCKED_DEPLOYMENT_IDS = "";
    await fixture.db
      .update(appDeployment)
      .set({ status: "uploading" })
      .where(eq(appDeployment.id, deploymentId));
    await expect(resolveAsset(request())).resolves.toHaveProperty("status", 404);
    await fixture.db
      .update(appDeployment)
      .set({ status: "published" })
      .where(eq(appDeployment.id, deploymentId));
    await fixture.db
      .update(appDeploymentFile)
      .set({ status: "failed" })
      .where(eq(appDeploymentFile.id, fileId));
    await expect(resolveAsset(request())).resolves.toHaveProperty("status", 404);
    expect(state.download).not.toHaveBeenCalled();
  });
});
