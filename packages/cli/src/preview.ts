import { createServer } from "node:http";
import type { Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import { loadTailorKitConfig } from "@tailorkit/app/config/loader";
import { createPreviewTunnelClient } from "@tailorkit/client-platform/preview-tunnel";
import { createTailorKitClient } from "@tailorkit/core/server";
import pc from "picocolors";
import { getDeployToken, runWhoami } from "./auth";

const maxPreviewAssetBytes = 1024 * 1024;

export interface PreviewOptions {
  configPath?: string;
  cwd: string;
  entry?: string;
  host?: string;
  mode?: string;
  outDir?: string;
  port?: number;
}

async function respondToPreviewAssetRequest(
  client: ReturnType<typeof createPreviewTunnelClient>,
  message: { id: string; method: "GET" | "HEAD"; path: string },
  localUrl: string,
): Promise<void> {
  try {
    const response = await fetch(new URL(message.path, localUrl), {
      method: message.method,
    });
    const responseLength = Number(response.headers.get("content-length"));
    if (Number.isFinite(responseLength) && responseLength > maxPreviewAssetBytes) {
      throw new Error("Preview asset exceeds the maximum supported size.");
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > maxPreviewAssetBytes) {
      throw new Error("Preview asset exceeds the maximum supported size.");
    }
    await client.respond({
      type: "response",
      id: message.id,
      status: response.status,
      body: bytes.toString("base64"),
      contentType: response.headers.get("content-type") ?? "application/octet-stream",
    });
  } catch {
    await client.respond({
      type: "response",
      id: message.id,
      status: 502,
      contentType: "text/plain",
      body: "",
    });
  }
}

function connectPreviewTunnel(tunnelUrl: string, tunnelToken: string, localUrl: string): void {
  let delay = 1000;
  const connect = () => {
    const socket = new WebSocket(tunnelUrl, tunnelToken);
    const client = createPreviewTunnelClient(socket);
    socket.addEventListener("open", () => {
      delay = 1000;
      void (async () => {
        try {
          const requests = await client.connect();
          for await (const message of requests) {
            void respondToPreviewAssetRequest(client, message, localUrl);
          }
        } catch {
          socket.close();
        }
      })();
    });
    socket.addEventListener("close", () => {
      setTimeout(connect, delay);
      delay = Math.min(delay * 2, 30_000);
    });
  };
  connect();
}

export async function runPreview(options: PreviewOptions): Promise<void> {
  const loaded = await loadTailorKitConfig(options.configPath, options.cwd);
  if (!loaded.config.appId) {
    throw new Error("Missing appId. Deploy once before starting a remote preview.");
  }
  const auth = await runWhoami(options);
  const stored = await getDeployToken(auth.hostUrl);
  if (!stored?.deployToken) {
    throw new Error("Not logged in. Run tailorkit login first.");
  }
  const client = createTailorKitClient({
    headers: { authorization: `Bearer ${stored.deployToken}` },
    url: auth.hostUrl,
  });
  const result = await client.preview.start({ appId: loaded.config.appId });
  const data = "data" in result ? result.data : result;
  if (!data) {
    throw new Error("Unable to start preview session.");
  }
  connectPreviewTunnel(
    data.tunnelUrl,
    data.tunnelToken,
    `http://${options.host ?? "127.0.0.1"}:${options.port ?? 4175}`,
  );
  await runExperimentalPreview(options);
  log.info(pc.green(`Host preview session: ${data.sessionId}`));
}

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const getContentType = (filepath: string): string =>
  contentTypes[path.extname(filepath)] ?? "application/octet-stream";

const parsePort = (value: unknown): number | undefined => {
  if (value === undefined) {
    return undefined;
  }
  const port = Number.parseInt(String(value), 10);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("--port must be a positive integer.");
  }
  return port;
};

export const toPreviewOptions = (options: Record<string, unknown>): PreviewOptions => ({
  configPath: options.config as string | undefined,
  cwd: String(options.cwd ?? "."),
  entry: options.entry as string | undefined,
  host: options.host as string | undefined,
  mode: options.mode as string | undefined,
  outDir: options.outDir as string | undefined,
  port: parsePort(options.port),
});

interface AppRegistryItem {
  clientPath: string;
  description?: string;
  id: string;
  name?: string;
}

const createStaticServer = (root: string, apps: readonly AppRegistryItem[]): Server =>
  createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (url.pathname === "/apps") {
        response.writeHead(200, {
          "access-control-allow-origin": "*",
          "content-type": "application/json; charset=utf-8",
        });
        response.end(JSON.stringify(apps));
        return;
      }

      const pathname = decodeURIComponent(url.pathname);
      const relativePath = pathname === "/" ? "client.js" : pathname.slice(1);
      const filepath = path.resolve(root, relativePath);
      const relativeToRoot = path.relative(root, filepath);

      if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const fileStat = await stat(filepath).catch(() => null);
      if (!fileStat?.isFile()) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, {
        "access-control-allow-origin": "*",
        "content-type": getContentType(filepath),
      });
      response.end(await readFile(filepath));
    } catch (error) {
      response.writeHead(500);
      response.end(error instanceof Error ? error.message : String(error));
    }
  });

const loadAppRegistry = async (root: string): Promise<AppRegistryItem[]> => {
  const packageJsonPath = path.join(root, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8")) as {
    description?: unknown;
    name?: unknown;
  };
  const id = typeof packageJson.name === "string" ? packageJson.name : path.basename(root);

  return [
    {
      clientPath: "/client.js",
      description:
        typeof packageJson.description === "string" ? packageJson.description : undefined,
      id,
      name: typeof packageJson.name === "string" ? packageJson.name : undefined,
    },
  ];
};

export const runExperimentalPreview = async (options: PreviewOptions): Promise<void> => {
  const loaded = await loadTailorKitConfig(options.configPath, options.cwd);
  const outDir = path.resolve(
    loaded.root,
    options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit",
  );
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4175;

  const { buildApp } = await import("@tailorkit/app/builder");
  const watcher = await buildApp({
    configPath: options.configPath,
    cwd: options.cwd,
    entry: options.entry,
    mode: options.mode,
    outDir: options.outDir,
    watch: true,
  });

  const closeWatcher = (): void => {
    if (watcher && typeof watcher === "object" && "close" in watcher) {
      void (watcher as { close: () => Promise<void> | void }).close();
    }
  };

  const server = createStaticServer(outDir, await loadAppRegistry(loaded.root));
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  server.removeAllListeners("error");

  process.once("SIGINT", () => {
    closeWatcher();
    server.close();
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    closeWatcher();
    server.close();
    process.exit(0);
  });

  log.info(pc.green(`Experimental preview running at http://${host}:${port}`));
  log.info(pc.dim(`Serving built app client from ${outDir}`));
};
