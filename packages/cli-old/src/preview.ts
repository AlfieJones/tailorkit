import { Hono } from "hono";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";
import { resolveClientOutDir, tailorkitWorkerFileName } from "./build";

const contentTypes: Record<string, string | undefined> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const previewIndex = (workerPath: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TailorKit Preview</title>
    <style>
      body {
        color: #151719;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        padding: 32px;
      }
      code {
        background: #f1f5f9;
        border-radius: 6px;
        padding: 2px 6px;
      }
    </style>
  </head>
  <body>
    <h1>TailorKit preview</h1>
    <p>Serving built client assets from <code>${workerPath}</code>.</p>
    <p>Load the worker with <code>new Worker("${workerPath}", { type: "module" })</code>.</p>
  </body>
</html>`;

const resolveStaticPath = (root: string, requestPath: string): string | null => {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.resolve(root, normalizedPath.replace(/^\/+/, ""));
  return filePath.startsWith(root) ? filePath : null;
};

export const previewSandbox = async (
  loadedConfig: LoadedTailorKitConfig,
  port: number,
): Promise<void> => {
  const clientOutDir = resolveClientOutDir(loadedConfig);
  const app = new Hono();

  app.get("/", (c) => c.html(previewIndex(`/${tailorkitWorkerFileName}`)));

  app.get("*", async (c) => {
    const filePath = resolveStaticPath(clientOutDir, c.req.path);
    if (filePath === null) {
      return c.text("Not found", 404);
    }

    try {
      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) {
        return c.text("Not found", 404);
      }

      const body = await readFile(filePath);
      const contentType = contentTypes[path.extname(filePath)] ?? "application/octet-stream";
      return new Response(body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
          "Content-Type": contentType,
        },
      });
    } catch {
      return c.text("Not found", 404);
    }
  });

  const server = Bun.serve({
    fetch: app.fetch,
    port,
  });

  const url = `http://${server.hostname}:${server.port}`;
  console.log(`TailorKit preview serving ${pc.cyan(clientOutDir)} at ${pc.cyan(url)}.`);
  console.log(`Worker: ${pc.cyan(`${url}/${tailorkitWorkerFileName}`)}`);

  await new Promise<never>(() => {});
};
