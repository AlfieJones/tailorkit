import path from "node:path";
import { build as viteBuild } from "vite";
import { loadTailorKitConfig } from "../config/loader";

export interface BuildAppOptions {
  configPath?: string;
  cwd?: string;
  entry?: string;
  mode?: string;
  outDir?: string;
  watch?: boolean;
}

export const buildApp = async (options: BuildAppOptions = {}): Promise<unknown> => {
  const loaded = await loadTailorKitConfig(options.configPath, options.cwd);
  const entry = options.entry ?? loaded.config.client?.entry ?? "./src/client.ts";
  const outDir = options.outDir ?? loaded.config.build?.outDir ?? ".tailorkit";

  return viteBuild({
    build: {
      emptyOutDir: true,
      lib: {
        entry: path.resolve(loaded.root, entry),
        fileName: "client",
        formats: ["es"],
      },
      outDir: path.resolve(loaded.root, outDir),
      watch: options.watch ? {} : null,
      minify: "oxc",
      // rolldownOptions: { external: ["preact"] },
    },
    configFile: false,
    mode: options.mode,
    root: loaded.root,
  });
};
