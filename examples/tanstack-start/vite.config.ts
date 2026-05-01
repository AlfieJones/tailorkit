import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

const root = import.meta.dirname;
const tailorkitClientDir = path.join(root, ".tailorkit/client");

const contentTypes: Record<string, string | undefined> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const tailorkitClientAssets = (): Plugin => {
  const serveAsset = async (
    requestUrl: string | undefined,
    response: {
      end: (chunk?: unknown) => void;
      setHeader: (name: string, value: string) => void;
      statusCode: number;
    },
  ): Promise<void> => {
    const url = new URL(requestUrl ?? "/", "http://tailorkit.local");
    const relativePath = decodeURIComponent(url.pathname.replace(/^\/tailorkit\/?/, "")).replace(
      /^\/+/,
      "",
    );
    const filePath = path.resolve(tailorkitClientDir, relativePath);

    if (!filePath.startsWith(tailorkitClientDir)) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    try {
      const fileStats = await stat(filePath);
      if (!fileStats.isFile()) {
        response.statusCode = 404;
        response.end("Not found");
        return;
      }

      response.setHeader(
        "Content-Type",
        contentTypes[path.extname(filePath)] ?? "application/octet-stream",
      );
      response.setHeader("Cache-Control", "no-store");
      response.end(await readFile(filePath));
    } catch {
      response.statusCode = 404;
      response.end("Run `bun run tailorkit build --cwd examples/tanstack-start` first.");
    }
  };

  return {
    configurePreviewServer(server) {
      server.middlewares.use("/tailorkit", (request, response) => {
        void serveAsset(request.url, response);
      });
    },
    configureServer(server) {
      server.middlewares.use("/tailorkit", (request, response) => {
        void serveAsset(request.url, response);
      });
    },
    name: "tailorkit-client-assets",
  };
};

export default defineConfig({
  plugins: [tailorkitClientAssets(), tanstackStart(), react(), nitro()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 4100,
  },
});
