import { describe, expect, it } from "vitest";
import { assetConfig } from "./config";
import { vercelAssetEnvironment, syncVercelAssets } from "./vercel";

const env = {
  CLOUDFLARE_DEFAULT_ACCOUNT_ID: "a".repeat(32),
  CLOUDFLARE_ZONE_ID: "b".repeat(32),
  ASSET_GATEWAY_SECRET: "synthetic-gateway-secret-at-least-32-characters",
  ASSET_DOMAIN: "staging-assets.example.com",
  PLATFORM_ORIGIN: "https://staging-platform.example.com",
  ASSET_VERCEL_PROJECT_ID: "prj_staging",
  ASSET_VERCEL_TEAM_ID: "team_test",
  VERCEL_TOKEN: "synthetic-vercel-token",
};

describe("asset infrastructure configuration", () => {
  it("keeps production names stable and staging separate", () => {
    const production = assetConfig("production", env);
    expect(production.domain).toBe("tailorkit.app");
    expect(production.platformOrigin).toBe("https://tailorkit.dev");
    expect(production.bucketName).toBe("tailorkit-app-assets-prod");
    expect(production.workerName).toBe("tailorkit-assets");
    const staging = assetConfig("staging", env);
    expect(staging.domain).toBe(env.ASSET_DOMAIN);
    expect(staging.bucketName).not.toBe(production.bucketName);
    expect(staging.workerName).not.toBe(production.workerName);
  });

  it("fails closed for implicit stages, absent credentials and production staging targets", () => {
    for (const stage of ["dev", "preview", "prod", ""]) {
      expect(() => assetConfig(stage, env)).toThrow();
    }
    for (const key of [
      "CLOUDFLARE_DEFAULT_ACCOUNT_ID",
      "CLOUDFLARE_ZONE_ID",
      "ASSET_GATEWAY_SECRET",
      "ASSET_DOMAIN",
      "PLATFORM_ORIGIN",
    ]) {
      expect(() => assetConfig("staging", { ...env, [key]: "" })).toThrow();
    }
    expect(() => assetConfig("staging", { ...env, ASSET_DOMAIN: "tailorkit.app" })).toThrow();
    expect(() =>
      assetConfig("staging", { ...env, PLATFORM_ORIGIN: "https://tailorkit.dev" }),
    ).toThrow();
    expect(() => assetConfig("production", { ...env, ASSET_GATEWAY_SECRET: "short" })).toThrow();
    expect(() =>
      vercelAssetEnvironment("staging", {
        ...env,
        ASSET_VERCEL_PROJECT_ID: "prj_j6dnFezdIT69bfAJyahTm1QKKLC9",
      }),
    ).toThrow();
  });

  it("rejects malformed or credential-bearing backend origins", () => {
    for (const origin of [
      "http://staging.example.com",
      "https://user:pass@staging.example.com",
      "https://staging.example.com/path",
      "https://staging.example.com?token=secret",
    ]) {
      expect(() => assetConfig("staging", { ...env, PLATFORM_ORIGIN: origin })).toThrow();
    }
  });

  it("syncs only the explicit asset settings and keeps the secret server-side", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const request: typeof fetch = (input, init) => {
      calls.push({ url: String(input), init });
      return Promise.resolve(
        Response.json({
          created: vercelAssetEnvironment("staging", env).variables.map(({ key }) => ({ key })),
          failed: [],
        }),
      );
    };
    await syncVercelAssets("staging", env, request);
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.url).toBe(
      "https://api.vercel.com/v10/projects/prj_staging/env?teamId=team_test&upsert=true",
    );
    const variables = vercelAssetEnvironment("staging", env).variables;
    expect(variables.map((item) => item.key).toSorted()).toEqual([
      "ASSET_DOMAIN",
      "ASSET_GATEWAY_SECRET",
      "BLOB_BUCKET",
      "BLOB_ENDPOINT",
      "BLOB_FORCE_PATH_STYLE",
      "BLOB_REGION",
    ]);
    expect(variables.find((item) => item.key === "ASSET_GATEWAY_SECRET")).toMatchObject({
      type: "sensitive",
      value: env.ASSET_GATEWAY_SECRET,
      target: ["production"],
    });
    expect(
      variables.some((item) => item.key.startsWith("VITE_") || item.key === "DATABASE_URL"),
    ).toBe(false);
    expect(call?.init?.body).toBe(JSON.stringify(variables));
    expect(call?.init?.redirect).toBe("error");
  });

  it("fails on Vercel errors without exposing response bodies", async () => {
    const failure: typeof fetch = () =>
      Promise.resolve(new Response(env.ASSET_GATEWAY_SECRET, { status: 403 }));
    await expect(syncVercelAssets("production", env, failure)).rejects.toThrow("HTTP 403");
    const partial: typeof fetch = () =>
      Promise.resolve(
        Response.json({ created: [], failed: [{ value: env.ASSET_GATEWAY_SECRET }] }),
      );
    await expect(syncVercelAssets("production", env, partial)).rejects.toThrow("did not confirm");
  });
});
