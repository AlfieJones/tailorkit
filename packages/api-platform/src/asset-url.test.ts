import { afterEach, describe, expect, it, vi } from "vitest";
import { withAppAssetUrl } from "./asset-url";

const env = vi.hoisted(() => ({
  ASSET_BASE_URL: undefined as string | undefined,
  ASSET_DOMAIN: "tailorkit.app",
  NODE_ENV: "production" as "development" | "production",
}));
vi.mock("@tailorkit/env/server", () => ({
  env,
  getBaseUrl: () => "http://localhost:3000",
}));

const projectId = "22222222-2222-4222-8222-222222222222";
const appId = "33333333-3333-4333-8333-333333333333";
const deploymentId = "44444444-4444-4444-8444-444444444444";

describe("hosted asset URLs", () => {
  afterEach(() => {
    env.ASSET_BASE_URL = undefined;
    env.NODE_ENV = "production";
  });

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
    expect(withAppAssetUrl(app, "abc123def45678", projectId).clientPath).toBe(
      `https://abc123def45678.tailorkit.app/p/${projectId}/a/${appId}/d/${deploymentId}/client.js`,
    );
  });

  it("uses the same-origin Node route in local development", () => {
    env.NODE_ENV = "development";
    const app = {
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
    expect(withAppAssetUrl(app, "abc123def45678", projectId).clientPath).toBe(
      `http://localhost:3000/api/assets?team=abc123def45678&project=${projectId}&app=${appId}&deployment=${deploymentId}`,
    );
  });

  it("supports the Node asset route in self-hosted production", () => {
    env.ASSET_BASE_URL = "https://tailorkit.example.com/api/assets/";
    const app = {
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
    expect(withAppAssetUrl(app, "abc123def45678", projectId).clientPath).toBe(
      `https://tailorkit.example.com/api/assets?team=abc123def45678&project=${projectId}&app=${appId}&deployment=${deploymentId}`,
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
      withAppAssetUrl({ currentDeployment: deployment }, "abc123def45678", projectId).clientPath,
    ).toBeUndefined();
  });
});
