import { readFile, realpath, stat } from "node:fs/promises";
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
  mode?: string;
  outDir?: string;
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

class PreviewAssetError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PreviewAssetError";
    this.status = status;
  }
}

interface PreviewAssetResponse {
  body: string;
  contentType: string;
  status: number;
}

const isPathOutsideRoot = (root: string, filepath: string): boolean => {
  const relativeToRoot = path.relative(root, filepath);
  return (
    relativeToRoot === ".." ||
    relativeToRoot.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeToRoot)
  );
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

async function getPreviewAssetResponse(
  message: { method: "GET" | "HEAD"; path: string },
  root: string,
): Promise<PreviewAssetResponse> {
  try {
    let pathname: string;
    try {
      pathname = decodeURIComponent(new URL(message.path, "http://localhost").pathname);
    } catch {
      throw new PreviewAssetError("Invalid preview asset path.", 400);
    }
    const filepath = path.resolve(root, pathname.slice(1));
    if (isPathOutsideRoot(root, filepath)) {
      throw new PreviewAssetError("Preview asset path is outside the build output.", 403);
    }

    const realFilepath = await realpath(filepath).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new PreviewAssetError("Preview asset was not found.", 404);
      }
      throw error;
    });
    if (isPathOutsideRoot(root, realFilepath)) {
      throw new PreviewAssetError("Preview asset path is outside the build output.", 403);
    }

    const fileStat = await stat(realFilepath);
    if (!fileStat?.isFile()) {
      throw new PreviewAssetError("Preview asset was not found.", 404);
    }
    if (fileStat.size > maxPreviewAssetBytes) {
      throw new PreviewAssetError("Preview asset exceeds the maximum supported size.", 413);
    }

    const bytes = message.method === "HEAD" ? undefined : await readFile(realFilepath);
    return {
      status: 200,
      body: bytes?.toString("base64") ?? "",
      contentType: getContentType(realFilepath),
    };
  } catch (error) {
    const response =
      error instanceof PreviewAssetError
        ? error
        : new PreviewAssetError(`Unable to read preview asset: ${errorMessage(error)}`, 500);
    log.error(response.message);
    return {
      status: response.status,
      body: Buffer.from(response.message).toString("base64"),
      contentType: "text/plain; charset=utf-8",
    };
  }
}

async function respondToPreviewAssetRequest(
  client: ReturnType<typeof createPreviewTunnelClient>,
  message: { id: string; method: "GET" | "HEAD"; path: string },
  root: string,
): Promise<void> {
  const response = await getPreviewAssetResponse(message, root);
  await client.respond({ type: "response", id: message.id, ...response });
}

async function connectPreviewTunnel(
  tunnelUrl: string,
  tunnelToken: string,
  root: string,
): Promise<() => void> {
  let delay = 1000;
  let closed = false;
  let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;
  let socket: WebSocket | undefined;
  let hasConnected = false;

  return await new Promise<() => void>((resolve, reject) => {
    const close = (): void => {
      closed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      socket?.close();
    };
    const failInitialConnection = (): void => {
      if (!hasConnected && !closed) {
        close();
        reject(new Error("Unable to connect to the preview tunnel."));
      }
    };
    const scheduleReconnect = (): void => {
      reconnectTimeout = setTimeout(connect, delay);
      delay = Math.min(delay * 2, 30_000);
    };
    const connect = (): void => {
      if (closed) {
        return;
      }
      let newSocket: WebSocket;
      try {
        newSocket = new WebSocket(tunnelUrl, tunnelToken);
      } catch {
        failInitialConnection();
        return;
      }
      socket = newSocket;
      const client = createPreviewTunnelClient(newSocket);
      newSocket.addEventListener("open", () => {
        delay = 1000;
        if (!hasConnected) {
          hasConnected = true;
          resolve(close);
        }
        void (async () => {
          try {
            const requests = await client.connect();
            for await (const message of requests) {
              void respondToPreviewAssetRequest(client, message, root).catch((error: unknown) => {
                log.error(`Unable to send preview asset response: ${errorMessage(error)}`);
              });
            }
          } catch (error) {
            log.error(`Preview tunnel request stream failed: ${errorMessage(error)}`);
            newSocket.close();
          }
        })();
      });
      newSocket.addEventListener("error", () => {
        failInitialConnection();
      });
      newSocket.addEventListener("close", () => {
        if (closed) {
          return;
        }
        if (!hasConnected) {
          failInitialConnection();
          return;
        }
        scheduleReconnect();
      });
    };
    connect();
  });
}

export const toPreviewOptions = (options: Record<string, unknown>): PreviewOptions => ({
  configPath: options.config as string | undefined,
  cwd: String(options.cwd ?? "."),
  entry: options.entry as string | undefined,
  mode: options.mode as string | undefined,
  outDir: options.outDir as string | undefined,
});

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
  const client = createTailorKitClient({
    headers: { authorization: `Bearer ${stored.deployToken}` },
    url: auth.hostUrl,
  });
  const result = await client.preview
    .start({ appId: loaded.config.appId })
    .catch((error: unknown) => {
      closeWatcher();
      throw error;
    });
  const data = "data" in result ? result.data : result;
  if (!data) {
    closeWatcher();
    throw new Error("Unable to start preview session.");
  }
  const outDir = path.resolve(
    loaded.root,
    options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit",
  );
  const root = await realpath(outDir).catch((error: unknown) => {
    closeWatcher();
    throw new Error(`Unable to resolve preview build output: ${errorMessage(error)}`);
  });
  const closeTunnel = await connectPreviewTunnel(data.tunnelUrl, data.tunnelToken, root).catch(
    (error: unknown) => {
      closeWatcher();
      throw error;
    },
  );
  const closePreview = (): void => {
    closeWatcher();
    closeTunnel();
    process.exit(0);
  };
  process.once("SIGINT", closePreview);
  process.once("SIGTERM", closePreview);
  log.info(pc.green(`Host preview session: ${data.sessionId}`));
  log.info(pc.dim(`Serving built app assets from ${outDir} through the preview tunnel`));
}
