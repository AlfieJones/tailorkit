#!/usr/bin/env bun
import { intro, log, outro, spinner } from "@clack/prompts";
import { cac } from "cac";
import pc from "picocolors";

import { buildSandbox } from "./build";
import { defineTailorKitConfig, loadTailorKitConfig } from "./config";
import { devSandbox } from "./dev";
import { generateTypes } from "./generate";
import { initApp } from "./init";

export { defineTailorKitConfig };

interface GlobalOptions {
  config?: string;
}

interface InitCommandOptions {
  force?: boolean;
  name?: string;
}

interface DevCommandOptions extends GlobalOptions {
  port?: string;
}

const cli = cac("tailorkit");

const run =
  <TArguments extends unknown[]>(action: (...args: TArguments) => Promise<void>) =>
  async (...args: TArguments): Promise<void> => {
    try {
      await action(...args);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  };

cli.option("--config <path>", "Path to tailorkit.config.ts");

cli
  .command("init [directory]", "Create a new TailorKit sandbox app")
  .option("--name <name>", "Package name")
  .option("--force", "Overwrite existing files")
  .action(
    run(async (directory: string | undefined, options: InitCommandOptions) => {
      intro(pc.bold("TailorKit init"));
      const targetDirectory = await initApp({
        cwd: process.cwd(),
        directory,
        force: options.force,
        name: options.name,
      });
      outro(`Created sandbox app at ${pc.cyan(targetDirectory)}.`);
    }),
  );

cli.command("generate", "Generate sandbox component types").action(
  run(async (options: GlobalOptions) => {
    const s = spinner();
    s.start("Generating TailorKit component types");
    const loadedConfig = await loadTailorKitConfig(options.config, process.cwd());
    const outputPath = await generateTypes(loadedConfig);
    s.stop(`Generated ${pc.cyan(outputPath)}.`);
  }),
);

cli.command("build", "Build the sandbox app").action(
  run(async (options: GlobalOptions) => {
    const s = spinner();
    s.start("Building TailorKit sandbox");
    const loadedConfig = await loadTailorKitConfig(options.config, process.cwd());
    const outDir = await buildSandbox(loadedConfig);
    s.stop(`Built sandbox to ${pc.cyan(outDir)}.`);
  }),
);

cli
  .command("dev", "Run the sandbox app with Vite")
  .option("--port <port>", "Dev server port", {
    default: undefined,
  })
  .action(
    run(async (options: DevCommandOptions) => {
      const loadedConfig = await loadTailorKitConfig(options.config, process.cwd());
      const port = options.port === undefined ? undefined : Number.parseInt(options.port, 10);
      if (port !== undefined && Number.isNaN(port)) {
        throw new Error("--port must be a number.");
      }
      await devSandbox(loadedConfig, port);
    }),
  );

cli.help();
cli.version("0.0.0");

cli.parse();
