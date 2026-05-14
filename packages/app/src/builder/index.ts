import path from "node:path";
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { build as viteBuild } from "vite";
import { loadTailorKitConfig } from "../config/loader";
import { assertSupportedPreactVersion } from "../preact-version";

const preactExternal = /^preact(?:\/.*)?$/u;

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
  const preactVersion = getInstalledPreactVersion(loaded.root);

  assertSupportedPreactVersion(preactVersion);

  const resolvedOutDir = path.resolve(loaded.root, outDir);
  const result = await viteBuild({
    build: {
      emptyOutDir: true,
      lib: {
        entry: path.resolve(loaded.root, entry),
        fileName: "client",
        formats: ["es"],
      },
      outDir: resolvedOutDir,
      watch: options.watch ? {} : null,
      minify: "oxc",
      rollupOptions: {
        external: (id) => preactExternal.test(id),
        output: {
          comments: {
            annotation: false,
            jsdoc: false,
            legal: false,
          },
          minify: true,
          minifyInternalExports: true,
        },
      },
    },
    configFile: false,
    mode: options.mode,
    root: loaded.root,
  });

  await writeFile(
    path.join(resolvedOutDir, "tailorkit-upload.json"),
    `${JSON.stringify(
      {
        assets: {
          client: "client.js",
        },
        limits: {
          clientMaxBytes: 1024 * 1024,
        },
        version: 1,
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );

  return result;
};

function getInstalledPreactVersion(root: string): string {
  const require = createRequire(path.join(root, "package.json"));

  try {
    const packageJsonPath = require.resolve("preact/package.json");
    const packageJson = require(packageJsonPath) as { version?: unknown };

    if (typeof packageJson.version === "string") {
      return packageJson.version;
    }
  } catch (error) {
    throw new Error(
      `TailorKit requires Preact to build an app. Install preact@^10 and try again.`,
      { cause: error },
    );
  }

  throw new Error("Unable to read the installed Preact version.");
}
