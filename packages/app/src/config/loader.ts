import { cosmiconfig } from "cosmiconfig";
import path from "node:path";
import type { ResolvedTailorKitConfig } from "./config";
import { tailorkitConfigSchema } from "./config";

export interface LoadedTailorKitConfig {
  config: ResolvedTailorKitConfig;
  filepath: string;
  root: string;
}

const explorer = cosmiconfig("tailorkit", {
  searchPlaces: ["tailorkit.config.ts", "tailorkit.config.mjs", "tailorkit.config.js"],
});

export const loadTailorKitConfig = async (
  configPath: string | undefined,
  cwd?: string,
): Promise<LoadedTailorKitConfig> => {
  const searchFrom = cwd !== undefined ? path.resolve(cwd) : process.cwd();

  const result =
    configPath !== undefined
      ? await explorer.load(path.resolve(searchFrom, configPath))
      : await explorer.search(searchFrom);

  if (result === null) {
    throw new Error(`Could not find tailorkit config from ${searchFrom}.`);
  }

  return {
    config: tailorkitConfigSchema.parse(result.config),
    filepath: result.filepath,
    root: path.dirname(result.filepath),
  };
};
