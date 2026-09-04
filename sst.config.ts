// oxlint-disable-next-line typescript/triple-slash-reference -- SST generates the global configuration API here.
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "tailorkit-assets",
      home: "cloudflare",
      version: "4.17.1",
      protect: input.stage === "production",
      removal: "retain-all",
      providers: { cloudflare: "6.15.0" },
    };
  },
  async run() {
    const { deployAssets } = await import("./infra/assets");
    return deployAssets($app.stage);
  },
});
