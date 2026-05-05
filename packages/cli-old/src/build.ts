import path from "node:path";
import { build } from "vite";
import type { Plugin } from "vite";

import type { LoadedTailorKitConfig } from "@tailorkit/app/config";

export const tailorkitClientOutputDirectory = "client";
export const tailorkitWorkerFileName = "worker.js";
export const defaultClientEntry = "./src/client.ts";

export const resolveClientEntry = (loadedConfig: LoadedTailorKitConfig): string =>
  loadedConfig.config.client?.entry ?? defaultClientEntry;

export const resolveClientOutDir = (loadedConfig: LoadedTailorKitConfig): string =>
  path.resolve(loadedConfig.root, loadedConfig.config.outDir, tailorkitClientOutputDirectory);

const VIRTUAL_ENTRY_ID = "\0tailorkit-worker-entry";

const workerEntryPlugin = (clientEntry: string): Plugin => ({
  name: "tailorkit-worker-entry",
  resolveId(id) {
    if (id === VIRTUAL_ENTRY_ID) {
      return VIRTUAL_ENTRY_ID;
    }
  },
  load(id) {
    if (id !== VIRTUAL_ENTRY_ID) {
      return;
    }
    return `
import { exposePreactWorker, Fragment } from "@tailorkit/app/worker";
import { h } from "preact";
import client from ${JSON.stringify(clientEntry)};

const screen = client.fallbackScreen;
exposePreactWorker(self, screen ? () => h(screen, {}) : () => h(Fragment, null));
`.trimStart();
  },
});

export const buildSandbox = async (loadedConfig: LoadedTailorKitConfig): Promise<string> => {
  const entry = path.resolve(loadedConfig.root, resolveClientEntry(loadedConfig));
  const outDir = resolveClientOutDir(loadedConfig);

  await build({
    build: {
      emptyOutDir: true,
      minify: false,
      assetsInlineLimit: 0,
      outDir,
      rollupOptions: {
        input: VIRTUAL_ENTRY_ID,
        output: {
          dir: outDir,
          entryFileNames: tailorkitWorkerFileName,
        },
      },
      sourcemap: true,
    },
    configFile: false,
    plugins: [workerEntryPlugin(entry)],
    root: loadedConfig.root,
  });

  return outDir;
};
