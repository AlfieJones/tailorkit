#!/usr/bin/env bun
import { intro, log, outro, spinner } from "@clack/prompts";
import { cac } from "cac";
import path from "node:path";
import pc from "picocolors";

import { buildSandbox } from "./build";
import { defineTailorKitConfig, loadTailorKitConfig } from "@tailorkit/app/config";
import { devSandbox } from "./dev";
import { generateTypes } from "./generate";
import { initApp } from "./init";
import { previewSandbox } from "./preview";

export { defineTailorKitConfig };

interface GlobalOptions {
  config?: string;
  cwd?: string;
}

interface InternalGlobalOptions {
  useWorkspaceDependencies: boolean;
}

interface InitCommandOptions {
  force?: boolean;
  format?: boolean;
  install?: boolean;
  lint?: boolean;
  name?: string;
  packageManager?: string;
}

interface DevCommandOptions extends GlobalOptions {
  port?: string;
}

interface PreviewCommandOptions extends GlobalOptions {
  port?: string;
}

const cli = cac("tailorkit");

const workspaceDepsFlag = "--internal-workspace-deps";

const resolveCwd = (cwd: string | undefined): string => path.resolve(process.cwd(), cwd ?? ".");

const parseInternalGlobalOptions = (
  args: string[],
): { args: string[]; options: InternalGlobalOptions } => {
  let useWorkspaceDependencies = false;
  const nextArgs: string[] = [];

  for (const arg of args) {
    if (arg === workspaceDepsFlag) {
      useWorkspaceDependencies = true;
      continue;
    }

    nextArgs.push(arg);
  }

  return {
    args: nextArgs,
    options: {
      useWorkspaceDependencies,
    },
  };
};

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
cli.option("--cwd <path>", "Working directory for TailorKit commands", {
  default: ".",
});

cli
  .command("init [directory]", "Create a new TailorKit sandbox app")
  .option("--name <name>", "Package name")
  .option("--package-manager <name>", "Package manager: bun, yarn, pnpm, or npm")
  .option("--lint", "Add oxlint; use --no-lint to skip")
  .option("--format", "Add oxfmt; use --no-format to skip")
  .option("--install", "Install dependencies after creating the app; use --no-install to skip")
  .option("--force", "Overwrite existing files")
  .action(
    run(async (directory: string | undefined, options: InitCommandOptions & GlobalOptions) => {
      intro(pc.bold("TailorKit init"));
      const targetDirectory = await initApp({
        cwd: resolveCwd(options.cwd),
        directory,
        force: options.force,
        formatting: options.format,
        install: options.install,
        linting: options.lint,
        name: options.name,
        packageManager: options.packageManager,
        useWorkspaceDependencies: internalGlobalOptions.useWorkspaceDependencies,
      });
      outro(`Created sandbox app at ${pc.cyan(targetDirectory)}.`);
    }),
  );

cli.command("generate", "Generate sandbox component types").action(
  run(async (options: GlobalOptions) => {
    const s = spinner();
    s.start("Generating TailorKit component types");
    const loadedConfig = await loadTailorKitConfig(options.config, options.cwd);
    const outputPath = await generateTypes(loadedConfig);
    s.stop(`Generated ${pc.cyan(outputPath)}.`);
  }),
);

cli.command("build", "Build the TailorKit client assets").action(
  run(async (options: GlobalOptions) => {
    const s = spinner();
    s.start("Building TailorKit client assets");
    const loadedConfig = await loadTailorKitConfig(options.config, options.cwd);
    const outDir = await buildSandbox(loadedConfig);
    s.stop(`Built client assets to ${pc.cyan(outDir)}.`);
  }),
);

cli
  .command("preview", "Serve built TailorKit client assets")
  .option("--port <port>", "Preview server port", {
    default: "4174",
  })
  .action(
    run(async (options: PreviewCommandOptions) => {
      const loadedConfig = await loadTailorKitConfig(options.config, options.cwd);
      const port = options.port === undefined ? 4174 : Number.parseInt(options.port, 10);
      if (Number.isNaN(port)) {
        throw new TypeError("--port must be a number.");
      }
      await previewSandbox(loadedConfig, port);
    }),
  );

cli
  .command("dev", "Run the sandbox app with Vite")
  .option("--port <port>", "Dev server port", {
    default: undefined,
  })
  .action(
    run(async (options: DevCommandOptions) => {
      const loadedConfig = await loadTailorKitConfig(options.config, options.cwd);
      const port = options.port === undefined ? undefined : Number.parseInt(options.port, 10);
      if (port !== undefined && Number.isNaN(port)) {
        throw new Error("--port must be a number.");
      }
      await devSandbox(loadedConfig, port);
    }),
  );

cli.help();
cli.version("0.0.0");

const { args, options: internalGlobalOptions } = parseInternalGlobalOptions(process.argv.slice(2));
const parsed = cli.parse([process.argv[0] ?? "bun", process.argv[1] ?? "tailorkit", ...args], {
  run: false,
});

await cli.runMatchedCommand();

if (args.length === 0 && !parsed.options.help && !parsed.options.version) {
  cli.outputHelp();
}
