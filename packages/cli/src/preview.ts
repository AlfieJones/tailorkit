import { createServer } from "node:http";
import type { Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import { buildApp } from "@tailorkit/app/builder";
import { loadTailorKitConfig } from "@tailorkit/app/config/loader";
import pc from "picocolors";

export interface PreviewOptions {
  configPath?: string;
  cwd: string;
  entry?: string;
  host?: string;
  mode?: string;
  outDir?: string;
  port?: number;
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

const createStaticServer = (root: string): Server =>
  createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
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

export const runExperimentalPreview = async (options: PreviewOptions): Promise<void> => {
  const loaded = await loadTailorKitConfig(options.configPath, options.cwd);
  const outDir = path.resolve(
    loaded.root,
    options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit",
  );
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4175;

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

  const server = createStaticServer(outDir);
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
  log.info(pc.dim(`Serving built worker assets from ${outDir}`));
};
