import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { gzip } from "node:zlib";
import type { TailorKitUploadManifest } from "@tailorkit/app/builder";
import { loadTailorKitConfig } from "@tailorkit/app/config/loader";
import { createTailorKitClient } from "@tailorkit/core/server";
import type { z } from "zod";
import { getDeployToken, runWhoami } from "./auth";

interface DeployOptions {
  configPath?: string;
  cwd: string;
  entry?: string;
  mode?: string;
  onMissingAppId?: (details: {
    appName: string;
    configPath: string;
    hostUrl: string;
  }) => Promise<boolean>;
  outDir?: string;
}

interface DeploymentAssetUpload {
  headers?: Record<string, string>;
  uploadUrl: string;
}

interface DeploymentCreateResult {
  assets: [DeploymentAssetUpload];
  deployment: {
    id: string;
  };
}

interface DeploymentPublishResult {
  id: string;
  status?: string;
}

interface AppCreateResult {
  id: string;
}

export interface DeployResult {
  appId: string;
  createdApp: boolean;
  deploymentId: string;
  hostUrl: string;
  status?: string;
  uploadedFiles: UploadedFileSummary[];
}

interface UploadedFileSummary {
  gzipSize: number;
  path: string;
  size: number;
}

const maxUploadBytes = 1024 * 1024;
const gzipAsync = promisify(gzip);

const unwrapRpcResult = <T>(result: unknown): T => {
  if (result && typeof result === "object" && "error" in result && result.error !== undefined) {
    throw result.error;
  }

  const data = result && typeof result === "object" && "data" in result ? result.data : result;
  const body = data && typeof data === "object" && "body" in data ? data.body : data;

  return body as T;
};

const readUploadManifest = async (
  outDir: string,
  schema: z.ZodType<TailorKitUploadManifest>,
): Promise<TailorKitUploadManifest> => {
  const manifestPath = path.join(outDir, "tailorkit-upload.json");
  return schema.parse(JSON.parse(await readFile(manifestPath, "utf-8")));
};

const sha256Hex = (content: Buffer): string => createHash("sha256").update(content).digest("hex");

const readAppName = async (root: string): Promise<string> => {
  try {
    const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf-8")) as {
      name?: unknown;
    };

    if (typeof packageJson.name === "string" && packageJson.name.trim()) {
      return packageJson.name.trim();
    }
  } catch {
    // Fall back to the directory name when package metadata is unavailable.
  }

  return path.basename(root);
};

const writeAppIdToConfig = async (configPath: string, appId: string): Promise<void> => {
  const source = await readFile(configPath, "utf-8");
  const appIdLine = `  appId: ${JSON.stringify(appId)},`;

  if (/^\s*appId\s*:/mu.test(source)) {
    await writeFile(
      configPath,
      source.replace(/^(\s*)appId\s*:\s*(['"]).*?\2\s*,?/mu, `$1appId: ${JSON.stringify(appId)},`),
      "utf-8",
    );
    return;
  }

  const exportDefaultObject = /(export\s+default\s+\{)(\r?\n)/u;
  if (exportDefaultObject.test(source)) {
    await writeFile(configPath, source.replace(exportDefaultObject, `$1$2${appIdLine}$2`), "utf-8");
    return;
  }

  const defineConfigObject =
    /(export\s+default\s+(?:defineTailorKitConfig|defineConfig)\(\s*\{)(\r?\n)/u;
  if (defineConfigObject.test(source)) {
    await writeFile(configPath, source.replace(defineConfigObject, `$1$2${appIdLine}$2`), "utf-8");
    return;
  }

  throw new Error(
    `Could not write appId to ${configPath}. Add appId: ${JSON.stringify(appId)} manually.`,
  );
};

const uploadAsset = async (asset: DeploymentAssetUpload, content: Buffer): Promise<void> => {
  if (content.byteLength > maxUploadBytes) {
    throw new Error(`Deployment asset exceeds ${maxUploadBytes} bytes.`);
  }

  const headers = new Headers(asset.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/javascript");
  }

  const response = await fetch(asset.uploadUrl, {
    body: new Uint8Array(content),
    headers,
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`Asset upload failed with ${response.status} ${response.statusText}.`);
  }
};

export const runDeploy = async (options: DeployOptions): Promise<DeployResult> => {
  const loaded = await loadTailorKitConfig(options.configPath, options.cwd);
  let appId = loaded.config.appId;
  let createdApp = false;

  const auth = await runWhoami(options);
  const storedAuth = await getDeployToken(auth.hostUrl);

  if (!storedAuth?.deployToken) {
    throw new Error(
      `Not logged in for ${auth.hostUrl}. Run tailorkit login after checking host in tailorkit.config.ts.`,
    );
  }

  const { buildApp, tailorkitUploadManifestSchema } = await import("@tailorkit/app/builder");
  await buildApp(options);

  const outDir = path.resolve(
    loaded.root,
    options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit",
  );
  const manifest = await readUploadManifest(outDir, tailorkitUploadManifestSchema);
  const clientAssetPath = path.join(outDir, manifest.assets.client);
  const clientAsset = await readFile(clientAssetPath);
  const clientAssetGzip = await gzipAsync(clientAsset);

  const client = createTailorKitClient({
    headers: { authorization: `Bearer ${storedAuth.deployToken}` },
    url: auth.hostUrl,
  });

  if (!appId) {
    const appName = await readAppName(loaded.root);
    const shouldCreateApp = await options.onMissingAppId?.({
      appName,
      configPath: loaded.filepath,
      hostUrl: auth.hostUrl,
    });

    if (!shouldCreateApp) {
      throw new Error("Missing appId in tailorkit.config.ts. Deployment cancelled.");
    }

    const app = unwrapRpcResult<AppCreateResult>(
      await client.apps.create({
        description: null,
        name: appName,
      }),
    );

    appId = app.id;
    createdApp = true;
    await writeAppIdToConfig(loaded.filepath, appId);
  }

  const created = unwrapRpcResult<DeploymentCreateResult>(
    await client.deployments.create({
      appId,
      assets: [
        {
          checksum: sha256Hex(clientAsset),
          contentLength: clientAsset.byteLength,
          contentType: "application/javascript",
          encoding: "utf-8",
          objectKey: manifest.assets.client,
        },
      ],
    }),
  );

  await uploadAsset(created.assets[0], clientAsset);

  const published = unwrapRpcResult<DeploymentPublishResult>(
    await client.deployments.publish({
      deploymentId: created.deployment.id,
      rollout: true,
    }),
  );

  return {
    appId,
    createdApp,
    deploymentId: published.id,
    hostUrl: auth.hostUrl,
    status: published.status,
    uploadedFiles: [
      {
        gzipSize: clientAssetGzip.byteLength,
        path: manifest.assets.client,
        size: clientAsset.byteLength,
      },
    ],
  };
};
