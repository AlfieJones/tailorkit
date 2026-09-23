import path from "node:path";
import { createRequire } from "node:module";
import { statSync, watch } from "node:fs";
import type { FSWatcher } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { validateLogoAsset } from "@tailorkit/asset-delivery/logo-validation";
import type { LogoContentType } from "@tailorkit/asset-delivery/logo-validation";
import { build as viteBuild } from "vite";
import { loadTailorKitConfig } from "../config/loader";
import { assertSupportedPreactVersion } from "../preact-version";
import { createTailorKitUploadManifest } from "./upload-manifest";

export {
  createTailorKitUploadManifest,
  tailorkitUploadManifestSchema,
  type TailorKitUploadManifest,
} from "./upload-manifest";

const preactPackageJson = "preact/package.json";
const preactPackageJsonModuleId = "\0tailorkit-preact-package-json";

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
  const resolvedEntry = path.resolve(loaded.root, entry);
  const logoPaths = (["light", "dark"] as const)
    .map((variant) => loaded.config.logos?.[variant])
    .filter((logoPath): logoPath is string => Boolean(logoPath))
    .map((logoPath) => path.resolve(loaded.root, logoPath));

  const writeUploadAssets = async () => {
    const logoManifest: { dark?: string; light?: string } = {};
    for (const variant of ["light", "dark"] as const) {
      const configuredPath = loaded.config.logos?.[variant];
      if (!configuredPath) {
        continue;
      }

      const extension = path.extname(configuredPath).toLowerCase().slice(1);
      const contentType = {
        png: "image/png",
        svg: "image/svg+xml",
        webp: "image/webp",
      }[extension] as LogoContentType | undefined;
      if (!contentType) {
        throw new Error(`The ${variant} logo must be an SVG, PNG, or WebP file.`);
      }

      const content = await readFile(path.resolve(loaded.root, configuredPath));
      validateLogoAsset(content, contentType);
      const filename = `logo-${variant}.${extension}`;
      await writeFile(path.join(resolvedOutDir, filename), content);
      logoManifest[variant] = filename;
    }

    await writeFile(
      path.join(resolvedOutDir, "tailorkit-upload.json"),
      `${JSON.stringify(createTailorKitUploadManifest(logoManifest), null, 2)}\n`,
      "utf-8",
    );
  };

  const build = (emptyOutDir: boolean) =>
    viteBuild({
      build: {
        emptyOutDir,
        lib: {
          entry: resolvedEntry,
          fileName: "client",
          formats: ["es"],
        },
        outDir: resolvedOutDir,
        watch: null,
        minify: "oxc",
        rollupOptions: {
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
      plugins: [
        {
          name: "tailorkit-preact-package-json",
          enforce: "pre",
          async closeBundle() {
            await writeUploadAssets();
          },
          resolveId(id) {
            if (id === preactPackageJson) {
              return preactPackageJsonModuleId;
            }

            return null;
          },
          load(id) {
            if (id === preactPackageJsonModuleId) {
              const version = JSON.stringify(preactVersion);

              return `export const version = ${version}; export default { version: ${version} };`;
            }

            return null;
          },
        },
      ],
      root: loaded.root,
    });
  const result = await build(true);

  if (!options.watch) {
    return result;
  }

  const watchers = new Map<string, FSWatcher>();
  const inputVersions = new Map<string, string>();
  let closed = false;
  let pending = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let fallbackInterval: ReturnType<typeof setInterval> | undefined;
  let rebuilding: Promise<void> = Promise.resolve();

  const inputVersion = (filepath: string): string => {
    try {
      const file = statSync(filepath);
      return `${file.size}:${file.mtimeMs}`;
    } catch {
      return "missing";
    }
  };

  const shouldIgnore = (filepath: string) => {
    const relativeToOutput = path.relative(resolvedOutDir, filepath);
    if (
      relativeToOutput === "" ||
      (!relativeToOutput.startsWith("..") && !path.isAbsolute(relativeToOutput))
    ) {
      return true;
    }
    return false;
  };

  const schedule = (directory: string, filename: string | Buffer | null) => {
    if (closed || (filename && shouldIgnore(path.join(directory, filename.toString())))) {
      return;
    }
    pending = true;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      if (rebuilding === idle) {
        void rebuild();
      }
    }, 100);
  };

  const startFallback = (error: unknown) => {
    if (fallbackInterval || closed) {
      return;
    }
    console.warn("TailorKit preview watcher unavailable; checking build inputs instead:", error);
    for (const activeWatcher of watchers.values()) {
      activeWatcher.close();
    }
    watchers.clear();
    fallbackInterval = setInterval(() => {
      for (const [filepath, version] of inputVersions) {
        const nextVersion = inputVersion(filepath);
        if (nextVersion !== version) {
          inputVersions.set(filepath, nextVersion);
          schedule(path.dirname(filepath), path.basename(filepath));
        }
      }
    }, 500);
  };

  const watchDirectory = (directory: string) => {
    if (watchers.has(directory) || fallbackInterval) {
      return;
    }
    try {
      const watcher = watch(directory, (_event, filename) => schedule(directory, filename));
      watcher.on("error", startFallback);
      watchers.set(directory, watcher);
    } catch (error) {
      startFallback(error);
    }
  };

  const addInputWatchers = (buildResult: Awaited<ReturnType<typeof viteBuild>>) => {
    const outputs = Array.isArray(buildResult) ? buildResult : [buildResult];
    const inputs = [resolvedEntry, ...logoPaths];
    for (const output of outputs) {
      if (!output || typeof output !== "object" || !("output" in output)) {
        continue;
      }
      for (const chunk of output.output) {
        if (chunk.type === "chunk") {
          inputs.push(
            ...Object.keys(chunk.modules).filter(
              (moduleId) => !moduleId.split(path.sep).includes("node_modules"),
            ),
          );
        }
      }
    }
    for (const input of inputs) {
      if (!path.isAbsolute(input) || shouldIgnore(input)) {
        continue;
      }
      inputVersions.set(input, inputVersion(input));
      const directory = path.dirname(input);
      watchDirectory(directory);
    }
  };

  const idle = rebuilding;
  const rebuild = () => {
    if (closed || !pending) {
      return;
    }
    pending = false;
    rebuilding = build(false)
      .then((nextResult) => addInputWatchers(nextResult))
      .catch((error: unknown) => console.error("TailorKit preview rebuild failed:", error))
      .then(() => {
        rebuilding = idle;
        if (pending && !closed) {
          void rebuild();
        }
      });
  };

  addInputWatchers(result);
  return {
    close: async () => {
      closed = true;
      if (timer) {
        clearTimeout(timer);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      for (const watcher of watchers.values()) {
        watcher.close();
      }
      await rebuilding;
    },
  };
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
