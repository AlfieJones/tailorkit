import { cosmiconfig } from "cosmiconfig";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

const componentSourceSchema = z.object({
  input: z.string().default("./tailorkit.schema.json"),
  output: z.string().default("./src/tailorkit.gen.ts"),
});

const clientConfigSchema = z.object({
  entry: z.string().default("./src/client.ts"),
});

const tailorkitConfigSchema = z.object({
  client: clientConfigSchema.optional(),
  components: componentSourceSchema.default({
    input: "./tailorkit.schema.json",
    output: "./src/tailorkit.gen.ts",
  }),
  entry: z.string().optional(),
  outDir: z.string().default(".tailorkit"),
  vite: z
    .object({
      plugins: z.array(z.unknown()).optional(),
    })
    .passthrough()
    .optional(),
});

export type TailorKitConfig = z.input<typeof tailorkitConfigSchema>;
type ResolvedTailorKitConfig = z.output<typeof tailorkitConfigSchema>;

export interface LoadedTailorKitConfig {
  config: ResolvedTailorKitConfig;
  filepath: string;
  root: string;
}

export const defineTailorKitConfig = (config: TailorKitConfig): TailorKitConfig => config;

const importConfig = async (filepath: string): Promise<unknown> => {
  const module = (await import(`${pathToFileURL(filepath).href}?t=${Date.now()}`)) as {
    default?: unknown;
  };
  return module.default ?? module;
};

const findPackageRoot = (startDirectory: string): string => {
  let currentDirectory = path.resolve(startDirectory);

  while (true) {
    if (existsSync(path.join(currentDirectory, "package.json"))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return path.resolve(startDirectory);
    }

    currentDirectory = parentDirectory;
  }
};

export const loadTailorKitConfig = async (
  configPath: string | undefined,
  cwd: string,
): Promise<LoadedTailorKitConfig> => {
  if (configPath !== undefined) {
    const filepath = path.resolve(cwd, configPath);
    const rawConfig = await importConfig(filepath);
    return {
      config: tailorkitConfigSchema.parse(rawConfig),
      filepath,
      root: path.dirname(filepath),
    };
  }

  const packageRoot = findPackageRoot(cwd);
  const expectedConfigPath = path.join(packageRoot, "tailorkit.config.ts");

  if (existsSync(expectedConfigPath)) {
    const rawConfig = await importConfig(expectedConfigPath);
    return {
      config: tailorkitConfigSchema.parse(rawConfig),
      filepath: expectedConfigPath,
      root: packageRoot,
    };
  }

  const explorer = cosmiconfig("tailorkit", {
    loaders: {
      ".ts": (_filepath, content) => {
        void content;
        return importConfig(_filepath);
      },
    },
    searchPlaces: ["tailorkit.config.ts", "tailorkit.config.js", "tailorkit.config.mjs"],
  });
  const result = await explorer.search(cwd);

  if (result === null) {
    throw new Error(`Could not find tailorkit.config.ts from ${cwd}.`);
  }

  return {
    config: tailorkitConfigSchema.parse(result.config),
    filepath: result.filepath,
    root: path.dirname(result.filepath),
  };
};
