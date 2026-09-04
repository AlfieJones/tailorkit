import { assetConfig } from "./config";

export async function deployAssets(stage: string) {
  const config = assetConfig(stage, process.env);
  if (process.env.ASSET_TLS_VERIFIED !== "true") {
    throw new Error("Verify TLS coverage for the asset wildcard before deploying");
  }
  const zone = await cloudflare.getZone({ zoneId: config.zoneId });
  if (
    zone.account.id !== config.accountId ||
    zone.status !== "active" ||
    zone.paused ||
    !(config.domain === zone.name || config.domain.endsWith(`.${zone.name}`))
  ) {
    throw new Error(
      "Asset domain must belong to the configured active Cloudflare zone and account",
    );
  }
  const bucket = new cloudflare.R2Bucket(
    "AssetsBucket",
    {
      accountId: config.accountId,
      name: config.bucketName,
      jurisdiction: "default",
    },
    {
      protect: true,
      retainOnDelete: true,
      // Import is deliberate: a missing production bucket must fail, never create a replacement.
      ...(config.production ? { import: `${config.accountId}/${config.bucketName}/default` } : {}),
    },
  );

  const worker = new sst.cloudflare.Worker("AssetsGateway", {
    accountId: config.accountId,
    handler: "apps/assets/src/index.ts",
    url: false,
    compatibility: { date: "2026-08-27", flags: ["nodejs_compat"] },
    environment: { ASSET_DOMAIN: config.domain, PLATFORM_ORIGIN: config.platformOrigin },
    transform: {
      worker(args, options) {
        args.accountId = config.accountId;
        args.scriptName = config.workerName;
        args.observability = { enabled: true, headSamplingRate: 0.1 };
        args.bindings = $output(args.bindings ?? []).apply((bindings) => [
          ...(bindings ?? []),
          {
            name: "ASSET_GATEWAY_SECRET",
            type: "secret_text",
            text: $util.secret(config.gatewaySecret),
          },
        ]);
        if (config.importWorker) {
          options.import = `${config.accountId}/${config.workerName}`;
        }
      },
    },
  });

  const dns = new cloudflare.DnsRecord(
    "AssetsWildcardDns",
    {
      zoneId: config.zoneId,
      name: `*.${config.domain}`,
      type: "AAAA",
      // Discard origin: if the Worker is unavailable, never bypass it to private storage.
      content: "100::",
      proxied: true,
      ttl: 1,
    },
    config.dnsImportId ? { import: `${config.zoneId}/${config.dnsImportId}` } : {},
  );
  const route = new cloudflare.WorkersRoute(
    "AssetsWildcardRoute",
    {
      zoneId: config.zoneId,
      pattern: `*.${config.domain}/*`,
      script: worker.nodes.worker.scriptName,
    },
    {
      dependsOn: [dns],
      ...(config.routeImportId ? { import: `${config.zoneId}/${config.routeImportId}` } : {}),
    },
  );

  // Only non-secret outputs. The platform keeps its existing private R2 credentials.
  return {
    assetDomain: config.domain,
    platformOrigin: config.platformOrigin,
    bucketName: bucket.name,
    storageEndpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    workerName: worker.nodes.worker.scriptName,
    routeId: route.id,
  };
}
