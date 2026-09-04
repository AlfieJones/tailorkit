/* oxlint-disable max-classes-per-file, typescript/no-extraneous-class -- Constructor doubles for independent cloud resources. */
import { afterEach, expect, it, vi } from "vitest";
import { deployAssets } from "./assets";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function setup() {
  const accountId = "a".repeat(32);
  vi.stubEnv("CLOUDFLARE_DEFAULT_ACCOUNT_ID", accountId);
  vi.stubEnv("CLOUDFLARE_ZONE_ID", "b".repeat(32));
  vi.stubEnv("ASSET_GATEWAY_SECRET", "synthetic-secret-at-least-32-characters");
  vi.stubEnv("ASSET_TLS_VERIFIED", "true");
  const bucket = vi.fn(
    class {
      name = "tailorkit-app-assets-prod";
    },
  );
  const dns = vi.fn(class {});
  const route = vi.fn(
    class {
      id = "route";
    },
  );
  const worker = vi.fn(
    class {
      nodes = { worker: { scriptName: "tailorkit-assets" } };
    },
  );
  const getZone = vi.fn().mockResolvedValue({
    account: { id: accountId },
    name: "tailorkit.app",
    status: "active",
    paused: false,
  });
  vi.stubGlobal("cloudflare", { R2Bucket: bucket, DnsRecord: dns, WorkersRoute: route, getZone });
  vi.stubGlobal("sst", { cloudflare: { Worker: worker } });
  return { accountId, bucket, dns, route, worker, getZone };
}

it("adopts and protects production storage and routes only the tenant wildcard", async () => {
  const mocks = setup();
  const output = await deployAssets("production");
  expect(mocks.bucket).toHaveBeenCalledWith(
    "AssetsBucket",
    expect.objectContaining({ name: "tailorkit-app-assets-prod" }),
    {
      protect: true,
      retainOnDelete: true,
      import: `${mocks.accountId}/tailorkit-app-assets-prod/default`,
    },
  );
  expect(mocks.worker).toHaveBeenCalledWith(
    "AssetsGateway",
    expect.objectContaining({
      url: false,
      environment: { ASSET_DOMAIN: "tailorkit.app", PLATFORM_ORIGIN: "https://tailorkit.dev" },
    }),
  );
  expect(mocks.dns).toHaveBeenCalledWith(
    "AssetsWildcardDns",
    expect.objectContaining({ name: "*.tailorkit.app", proxied: true, content: "100::" }),
    {},
  );
  expect(mocks.route).toHaveBeenCalledWith(
    "AssetsWildcardRoute",
    expect.objectContaining({ pattern: "*.tailorkit.app/*" }),
    expect.objectContaining({ dependsOn: expect.any(Array) }),
  );
  expect(JSON.stringify(output)).not.toContain("synthetic-secret");
});

it("rejects the wrong zone before declaring any resources", async () => {
  const mocks = setup();
  mocks.getZone.mockResolvedValue({
    account: { id: mocks.accountId },
    name: "other.example",
    status: "active",
  });
  await expect(deployAssets("production")).rejects.toThrow("configured active Cloudflare zone");
  expect(mocks.bucket).not.toHaveBeenCalled();
  expect(mocks.worker).not.toHaveBeenCalled();
});
