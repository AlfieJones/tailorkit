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

async function respondToPreviewAssetRequest(
  client: ReturnType<typeof createPreviewTunnelClient>,
  message: { id: string; method: "GET" | "HEAD"; path: string },
  root: string,
): Promise<void> {
  try {
    const pathname = decodeURIComponent(new URL(message.path, "http://localhost").pathname);
    const filepath = path.resolve(root, pathname.slice(1));
    const relativeToRoot = path.relative(root, filepath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Preview asset path is outside the build output.");
    }

    const fileStat = await stat(filepath).catch(() => null);
    if (!fileStat?.isFile()) {
      await client.respond({
        type: "response",
        id: message.id,
        status: 404,
        body: "",
        contentType: "text/plain; charset=utf-8",
      });
      return;
    }
    if (fileStat.size > maxPreviewAssetBytes) {
      throw new Error("Preview asset exceeds the maximum supported size.");
    }

    const bytes = message.method === "HEAD" ? undefined : await readFile(filepath);
    await client.respond({
      type: "response",
      id: message.id,
      status: 200,
      body: bytes?.toString("base64") ?? "",
      contentType: getContentType(filepath),
    });
  } catch {
    await client.respond({
      type: "response",
      id: message.id,
      status: 502,
      contentType: "text/plain; charset=utf-8",
      body: "",
    });
  }
}

function connectPreviewTunnel(tunnelUrl: string, tunnelToken: string, root: string): () => void {
  let delay = 1000;
  let closed = false;
  let socket: WebSocket | undefined;
  const connect = () => {
    if (closed) {
      return;
    }
    const newSocket = new WebSocket(tunnelUrl, tunnelToken);
    socket = newSocket;
    const client = createPreviewTunnelClient(newSocket);
    newSocket.addEventListener("open", () => {
      delay = 1000;
      void (async () => {
        try {
          const requests = await client.connect();
          for await (const message of requests) {
            void respondToPreviewAssetRequest(client, message, root);
          }
        } catch {
          newSocket.close();
        }
      })();
    });
    newSocket.addEventListener("close", () => {
      if (closed) {
        return;
      }
      setTimeout(connect, delay);
      delay = Math.min(delay * 2, 30_000);
    });
  };
  connect();
  return () => {
    closed = true;
    socket?.close();
  };
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
  const closeTunnel = connectPreviewTunnel(data.tunnelUrl, data.tunnelToken, outDir);
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
