import path from "node:path";
import { build } from "vite";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";

export const tailorkitClientOutputDirectory = "client";
export const tailorkitWorkerFileName = "worker.js";
export const defaultClientEntry = "./src/client.ts";

export const resolveClientEntry = (loadedConfig: LoadedTailorKitConfig): string =>
  loadedConfig.config.client?.entry ?? defaultClientEntry;

export const resolveClientOutDir = (loadedConfig: LoadedTailorKitConfig): string =>
  path.resolve(loadedConfig.root, loadedConfig.config.outDir, tailorkitClientOutputDirectory);

export const buildSandbox = async (loadedConfig: LoadedTailorKitConfig): Promise<string> => {
  const entry = path.resolve(loadedConfig.root, resolveClientEntry(loadedConfig));
  const outDir = resolveClientOutDir(loadedConfig);

  await build({
    build: {
      emptyOutDir: true,
      minify: "oxc",
      assetsInlineLimit: 0,
      outDir,
      rollupOptions: {
        input: entry,
        output: {
          dir: outDir,
          entryFileNames: tailorkitWorkerFileName,
        },
      },
      sourcemap: true,
    },
    configFile: false,
    root: loadedConfig.root,
  });

  return outDir;
};
