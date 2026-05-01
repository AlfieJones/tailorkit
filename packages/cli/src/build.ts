import path from "node:path";
import { build } from "vite";
import type { InlineConfig } from "vite";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";

export const buildSandbox = async (loadedConfig: LoadedTailorKitConfig): Promise<string> => {
  const clientEntry =
    loadedConfig.config.client?.entry ?? loadedConfig.config.entry ?? "./src/client.ts";
  const entry = path.resolve(loadedConfig.root, clientEntry);
  const outDir = path.resolve(loadedConfig.root, loadedConfig.config.outDir);
  const viteConfig = (loadedConfig.config.vite ?? {}) as InlineConfig;

  await build({
    ...viteConfig,
    build: {
      ...viteConfig.build,
      emptyOutDir: true,
      lib: {
        entry,
        fileName: "sandbox",
        formats: ["es"],
      },
      outDir,
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name]-[hash][extname]",
          chunkFileNames: "chunks/[name]-[hash].js",
          entryFileNames: "sandbox.js",
        },
      },
      sourcemap: true,
    },
    configFile: false,
    root: loadedConfig.root,
  });

  return outDir;
};
