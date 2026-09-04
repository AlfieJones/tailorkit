const cloudflareId = /^[a-f0-9]{32}$/u;
const domainName = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/u;

export function required(env: NodeJS.ProcessEnv, name: string) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function platformOrigin(production: boolean, env: NodeJS.ProcessEnv) {
  const origin = new URL(production ? "https://tailorkit.dev" : required(env, "PLATFORM_ORIGIN"));
  if (
    origin.protocol !== "https:" ||
    origin.username ||
    origin.password ||
    origin.port ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    (!production && origin.hostname === "tailorkit.dev")
  ) {
    throw new Error(
      "PLATFORM_ORIGIN must be an HTTPS origin; staging cannot use the production platform",
    );
  }
  return origin.origin;
}

export function assetConfig(stage: string, env: NodeJS.ProcessEnv) {
  if (stage !== "production" && stage !== "staging") {
    throw new Error("Asset infrastructure supports only staging and production stages");
  }
  const production = stage === "production";
  const accountId = required(env, "CLOUDFLARE_DEFAULT_ACCOUNT_ID");
  const zoneId = required(env, "CLOUDFLARE_ZONE_ID");
  if (!cloudflareId.test(accountId) || !cloudflareId.test(zoneId)) {
    throw new Error("Cloudflare account and zone IDs must be 32 lowercase hexadecimal characters");
  }
  const domain = production ? "tailorkit.app" : required(env, "ASSET_DOMAIN");
  if (!domainName.test(domain) || (!production && domain === "tailorkit.app")) {
    throw new Error("Staging must use its own valid asset domain, not tailorkit.app");
  }
  const gatewaySecret = required(env, "ASSET_GATEWAY_SECRET");
  if (gatewaySecret.length < 32) {
    throw new Error("ASSET_GATEWAY_SECRET must contain at least 32 characters");
  }
  return {
    stage,
    production,
    accountId,
    zoneId,
    domain,
    platformOrigin: platformOrigin(production, env),
    gatewaySecret,
    bucketName: production ? "tailorkit-app-assets-prod" : "tailorkit-app-assets-staging",
    workerName: production ? "tailorkit-assets" : "tailorkit-assets-staging",
    dnsImportId: env.ASSET_DNS_RECORD_ID?.trim() || undefined,
    routeImportId: env.ASSET_WORKER_ROUTE_ID?.trim() || undefined,
    importWorker: env.ASSET_IMPORT_WORKER === "true",
  };
}
