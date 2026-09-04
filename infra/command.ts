import { assetConfig, required } from "./config.ts";
import { syncVercelAssets, vercelAssetEnvironment } from "./vercel.ts";

const [command, stage] = process.argv.slice(2);
if (!stage) {
  throw new Error("Specify an explicit staging or production stage");
}

try {
  switch (command) {
    case "validate": {
      assetConfig(stage, process.env);
      vercelAssetEnvironment(stage, process.env);
      required(process.env, "CLOUDFLARE_API_TOKEN");
      required(process.env, "VERCEL_TOKEN");
      if (process.env.ASSET_TLS_VERIFIED !== "true") {
        throw new Error(
          "Verify TLS coverage for the exact asset wildcard, then set ASSET_TLS_VERIFIED=true",
        );
      }
      break;
    }
    case "sync-vercel": {
      await syncVercelAssets(stage, process.env);
      break;
    }
    default: {
      throw new Error("Expected validate or sync-vercel");
    }
  }
} catch (error) {
  // Network errors can include request details. Only validation errors are safe to show.
  process.stderr.write(
    command === "validate" && error instanceof Error
      ? `${error.message}\n`
      : "Asset environment sync failed; inspect credentials and retry. No values were logged.\n",
  );
  process.exitCode = 1;
}
