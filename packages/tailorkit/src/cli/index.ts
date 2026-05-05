#!/usr/bin/env node
import { intro, log, outro } from "@clack/prompts";
import { cac } from "cac";
import pc from "picocolors";

import { runInit } from "./init";

const cli = cac("tailorkit");

cli.option("--cwd <path>", "Working directory", { default: "." });

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
      const cwd = String(options["cwd"] ?? ".");
      const targetDirectory = await runInit({
        cwd,
        directory,
        force: options["force"] as boolean | undefined,
        formatting: options["format"] as boolean | undefined,
        install: options["install"] as boolean | undefined,
        linting: options["lint"] as boolean | undefined,
        name: options["name"] as string | undefined,
        packageManager: options["packageManager"] as string | undefined,
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
