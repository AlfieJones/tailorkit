import { createHash } from "node:crypto";
import { readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import { loadTailorKitConfig } from "@tailorkit/app/config/loader";
import { createPreviewWebSocketClient } from "@tailorkit/client-platform/preview";
import type {
  PreviewBuildManifest,
  PreviewWebSocketClient,
} from "@tailorkit/client-platform/preview";
import { createTailorKitClient } from "@tailorkit/core/server";
import pc from "picocolors";
import { getDeployToken, runWhoami } from "./auth";

const chunkBytes = 256 * 1024;
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export interface PreviewOptions {
  configPath?: string;
  cwd: string;
  entry?: string;
  mode?: string;
  outDir?: string;
}
interface Snapshot {
  files: Buffer[];
  manifest: PreviewBuildManifest;
  fingerprint: string;
}

export async function capturePreviewSnapshot(root: string): Promise<Snapshot> {
  const actualRoot = await realpath(root);
  const outputEntries = await readdir(actualRoot, { recursive: true, withFileTypes: true });
  const entries = outputEntries
    .filter((entry) => entry.isFile())
    .toSorted((a, b) =>
      path.join(a.parentPath, a.name).localeCompare(path.join(b.parentPath, b.name)),
    );
  if (entries.length > 100) {
    throw new Error("Preview build exceeds 100 files.");
  }
  const files: Buffer[] = [];
  const manifest: PreviewBuildManifest = { files: [] };
  let total = 0;
  for (const entry of entries) {
    const resolved = await realpath(path.join(entry.parentPath, entry.name));
    const relative = path.relative(actualRoot, resolved).replaceAll(path.sep, "/");
    if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
      throw new Error("Preview file escapes the build output.");
    }
    const bytes = await readFile(resolved);
    if (bytes.length > 1024 * 1024) {
      throw new Error(`Preview file ${relative} exceeds 1 MiB.`);
    }
    total += bytes.length;
    if (total > 10 * 1024 * 1024) {
      throw new Error("Preview build exceeds 10 MiB.");
    }
    files.push(bytes);
    manifest.files.push({
      path: relative,
      contentType: contentTypes[path.extname(relative)] ?? "application/octet-stream",
      size: bytes.length,
      chunks: Math.ceil(bytes.length / chunkBytes),
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  if (!manifest.files.some((file) => file.path === "client.js")) {
    throw new Error("Preview build is missing client.js.");
  }
  return {
    files,
    manifest,
    fingerprint: createHash("sha256").update(JSON.stringify(manifest)).digest("hex"),
  };
}

export async function uploadPreviewSnapshot(
  client: PreviewWebSocketClient,
  current: Snapshot,
): Promise<void> {
  const { buildId } = await client.beginBuild({ manifest: current.manifest });
  for (const [fileIndex, bytes] of current.files.entries()) {
    for (
      let chunkIndex = 0;
      chunkIndex < (current.manifest.files[fileIndex]?.chunks ?? 0);
      chunkIndex++
    ) {
      await client.uploadChunk({
        buildId,
        fileIndex,
        chunkIndex,
        base64: bytes
          .subarray(chunkIndex * chunkBytes, (chunkIndex + 1) * chunkBytes)
          .toString("base64"),
      });
    }
  }
  await client.commitBuild({ buildId });
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
  const watcher = await buildApp({ ...options, watch: true });
  const closeWatcher = () => {
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
  const cleanupClient = createTailorKitClient({
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5000) }),
    headers: { authorization: `Bearer ${stored.deployToken}` },
    url: auth.hostUrl,
  });
  const stop = async () => {
    try {
      await cleanupClient.preview.stop({ sessionId: data.sessionId });
    } catch (error) {
      log.warn(`Unable to end preview session: ${errorMessage(error)}`);
    }
  };
  const outDir = path.resolve(
    loaded.root,
    options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit",
  );
  const root = await realpath(outDir);
  let latest = await capturePreviewSnapshot(root);
  let uploadedFingerprint: string | undefined;
  let activeClient: PreviewWebSocketClient | undefined;
  let activeSocket: WebSocket | undefined;
  let closed = false;
  let uploading = false;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  let lastUploadStart = 0;
  let reconnectDelay = 1000;
  let connectionGeneration = 0;
  const scheduleUpload = () => {
    if (closed || !activeClient || uploading) {
      return;
    }
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(
      () => {
        idleTimer = undefined;
        if (!activeClient || latest.fingerprint === uploadedFingerprint) {
          return;
        }
        const current = latest;
        const wsClient = activeClient;
        const generation = connectionGeneration;
        uploading = true;
        lastUploadStart = Date.now();
        void uploadPreviewSnapshot(wsClient, current)
          .then(() => {
            if (generation === connectionGeneration) {
              uploadedFingerprint = current.fingerprint;
            }
          })
          .catch((error: unknown) => {
            if (!closed) {
              log.warn(`Preview upload interrupted: ${errorMessage(error)}`);
            }
          })
          .finally(() => {
            if (generation === connectionGeneration) {
              uploading = false;
              if (latest.fingerprint !== uploadedFingerprint) {
                scheduleUpload();
              }
            }
          });
      },
      Math.max(500, 500 - (Date.now() - lastUploadStart)),
    );
  };
  const capture = async () => {
    try {
      latest = await capturePreviewSnapshot(root);
      scheduleUpload();
    } catch (error) {
      log.warn(`Keeping the last successful preview: ${errorMessage(error)}`);
    }
  };
  if (watcher && typeof watcher === "object" && "on" in watcher) {
    (watcher as { on: (name: string, listener: (event: { code: string }) => void) => void }).on(
      "event",
      (event) => {
        if (event.code === "BUNDLE_END") {
          void capture();
        }
      },
    );
  }
  const connect = () => {
    if (closed) {
      return;
    }
    const url = new URL(data.tunnelUrl);
    url.searchParams.set("role", "uploader");
    const socket = new WebSocket(url, data.tunnelToken);
    activeSocket = socket;
    socket.addEventListener("open", () => {
      connectionGeneration += 1;
      reconnectDelay = 1000;
      activeClient = createPreviewWebSocketClient(socket);
      uploadedFingerprint = undefined;
      const sendHeartbeat = () => void activeClient?.heartbeat().catch(() => socket.close());
      sendHeartbeat();
      heartbeatTimer = setInterval(sendHeartbeat, 20_000);
      scheduleUpload();
    });
    socket.addEventListener("close", () => {
      connectionGeneration += 1;
      uploading = false;
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      if (activeSocket === socket) {
        activeSocket = undefined;
        activeClient = undefined;
      }
      if (!closed) {
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      }
    });
    socket.addEventListener("error", () => socket.close());
  };
  connect();
  const closePreview = () => {
    if (closed) {
      return;
    }
    closed = true;
    closeWatcher();
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
    activeSocket?.close();
    void stop().finally(() => process.exit(0));
  };
  process.once("SIGINT", closePreview);
  process.once("SIGTERM", closePreview);
  const shareUrl = new URL(auth.hostUrl);
  shareUrl.pathname = `${shareUrl.pathname.replace(/\/+$/u, "")}/preview/${data.shareId}`;
  log.info(pc.green(`Host preview: ${shareUrl.href}`));
  log.info(pc.dim(`Uploading built app assets from ${outDir}`));
}
