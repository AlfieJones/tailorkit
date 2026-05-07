#!/usr/bin/env bun
import { intro, log, outro } from "@clack/prompts";
import { cac } from "cac";
import pc from "picocolors";

import { generateTypes } from "./generator/types";
import { runInit } from "./init";
import { runExperimentalPreview, toPreviewOptions } from "./preview";
import { runExperimentalSchema } from "./schema";

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
      const { buildApp } = await import("@tailorkit/app/builder");
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
  .command("experimental-schema <path>", "Serialize and print the TailorKit schema from a module")
  .action(async (filePath: string, options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      await runExperimentalSchema({
        cwd: String(options.cwd ?? "."),
        filePath,
      });
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("generate", "Generate TailorKit app bindings")
  .option("--schema <path>", "Path to tailorkit schema JSON")
  .option("--out <path>", "Generated TypeScript output file")
  .option(
    "--experimental-schema-file <path>",
    "Path to a TypeScript module that exports a TailorKit schema",
  )
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      const outPath = await generateTypes({
        cwd: String(options.cwd ?? "."),
        experimentalSchemaFile: options.experimentalSchemaFile as string | undefined,
        outFile: options.out as string | undefined,
        schemaFile: options.schema as string | undefined,
      });
      outro(`Generated ${pc.cyan(outPath)}.`);
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
