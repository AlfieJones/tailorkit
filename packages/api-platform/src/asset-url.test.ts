import { describe, expect, it, vi } from "vitest";
import { withAppAssetUrl } from "./asset-url";

vi.mock("@tailorkit/env/server", () => ({
  env: {
    ASSET_DOMAIN: "tailorkit.app",
  },
}));

const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "33333333-3333-4333-8333-333333333333";
const deploymentId = "44444444-4444-4444-8444-444444444444";

describe("hosted asset URLs", () => {
  it("uses stable team, project, app and deployment identifiers", () => {
    const app = {
      id: appId,
      currentDeployment: {
        id: deploymentId,
        appId,
        publicId: "deployment1",
        status: "published" as const,
        clientEntryFileId: "55555555-5555-4555-8555-555555555555",
        errorMessage: null,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    expect(withAppAssetUrl(app, "abc123def4", projectId).clientPath).toBe(
      `https://abc123def4.tailorkit.app/p/${projectId}/a/${appId}/d/${deploymentId}/client.js`,
    );
  });

  it("does not expose incomplete deployments", () => {
    const deployment = {
      id: deploymentId,
      appId,
      publicId: "deployment1",
      status: "uploading" as const,
      clientEntryFileId: null,
      errorMessage: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(
      withAppAssetUrl({ currentDeployment: deployment }, "abc123def4", projectId).clientPath,
    ).toBeUndefined();
  });
});
