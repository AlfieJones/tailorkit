#!/usr/bin/env node
import { intro, log, outro } from "@clack/prompts";
import { buildApp } from "@tailorkit/app/builder";
import { cac } from "cac";
import pc from "picocolors";

import { runInit } from "./init";
import { runExperimentalPreview, toPreviewOptions } from "./preview";

const cli = cac("tailorkit");

cli.option("--cwd <path>", "Working directory", { default: "." });

cli
  .command("build", "Build the TailorKit app")
  .option("--config <path>", "Path to tailorkit config")
  .option("--entry <path>", "Client entry file")
  .option("--out-dir <path>", "Build output directory")
  .option("--mode <mode>", "Vite mode")
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      await buildApp({
        configPath: options.config as string | undefined,
        cwd: String(options.cwd ?? "."),
        entry: options.entry as string | undefined,
        mode: options.mode as string | undefined,
        outDir: options.outDir as string | undefined,
      });
      outro("Built app.");
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("experimental-preview", "Build and preview the TailorKit worker")
  .option("--config <path>", "Path to tailorkit config")
  .option("--entry <path>", "Client entry file")
  .option("--out-dir <path>", "Build output directory")
  .option("--host <host>", "Preview host")
  .option("--port <port>", "Preview port")
  .option("--mode <mode>", "Vite mode")
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      await runExperimentalPreview(toPreviewOptions(options));
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("init [directory]", "Create a new TailorKit app")
  .option("--name <name>", "Package name")
  .option("--package-manager <pm>", "Package manager: bun, yarn, pnpm, or npm")
  .option("--lint", "Add oxlint (use --no-lint to skip)")
  .option("--format", "Add oxfmt (use --no-format to skip)")
  .option("--install", "Install dependencies after scaffolding (use --no-install to skip)")
  .option("--force", "Overwrite existing files")
  .action(async (directory: string | undefined, options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      const cwd = String(options.cwd ?? ".");
      const targetDirectory = await runInit({
        cwd,
        directory,
        force: options.force as boolean | undefined,
        formatting: options.format as boolean | undefined,
        install: options.install as boolean | undefined,
        linting: options.lint as boolean | undefined,
        name: options.name as string | undefined,
        packageManager: options.packageManager as string | undefined,
      });
      outro(`Created app at ${pc.cyan(targetDirectory)}.`);
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli.help();
cli.version("0.0.0");
cli.parse();
