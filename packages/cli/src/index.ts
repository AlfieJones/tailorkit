#!/usr/bin/env node
import { confirm, intro, isCancel, log, outro, spinner } from "@clack/prompts";
import { cac } from "cac";
import pc from "picocolors";

import { createCliAuthApprovalUrl, runLogin, runLogout, runWhoami } from "./auth";
import { runDeploy } from "./deploy";
import { generateTypes } from "./generator/types";
import { runInit } from "./init";
import { runExperimentalPreview, toPreviewOptions } from "./preview";
import { runExperimentalSchema } from "./schema";
import { openUrlInBrowser } from "./utils/open-browser";

const cli = cac("tailorkit");

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
};

cli.option("--cwd <path>", "Working directory", { default: "." });

cli
  .command("login", "Authenticate the TailorKit CLI with a host app")
  .option("--config <path>", "Path to tailorkit config")
  .option("--open", "Open the approval URL in the default browser", { default: true })
  .option("--timeout <seconds>", "Seconds to wait for approval", { default: 1800 })
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    const approvalSpinner = spinner();
    let isWaitingForApproval = false;
    try {
      const timeoutSeconds = Number.parseInt(String(options.timeout ?? "1800"), 10);
      if (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0) {
        throw new Error("--timeout must be a positive integer.");
      }

      await runLogin(
        {
          configPath: options.config as string | undefined,
          cwd: String(options.cwd ?? "."),
          timeout: timeoutSeconds * 1000,
        },
        ({ expiresAt, hostUrl, userCode }) => {
          const approvalUrl = createCliAuthApprovalUrl(hostUrl, userCode);
          if (options.open !== false) {
            void openUrlInBrowser(approvalUrl);
          }

          log.info(`Enter this code in the host app: ${pc.bold(userCode)}`);
          log.info(`Approval URL: ${pc.cyan(approvalUrl)}`);
          log.info(`Code expires at ${expiresAt.toLocaleString()}.`);
          log.info("Waiting for approval...");
          approvalSpinner.start("Checking approval status");
          isWaitingForApproval = true;
        },
      );

      if (isWaitingForApproval) {
        approvalSpinner.stop("Approved.");
      }
      outro("Authenticated successfully.");
    } catch (error) {
      if (isWaitingForApproval) {
        approvalSpinner.stop("Approval failed.");
      }
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("logout", "Remove stored TailorKit CLI credentials for a host app")
  .option("--config <path>", "Path to tailorkit config")
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      const result = await runLogout({
        configPath: options.config as string | undefined,
        cwd: String(options.cwd ?? "."),
      });

      outro(
        result.removed
          ? `Logged out of ${pc.cyan(result.hostUrl)}.`
          : `No stored credentials found for ${pc.cyan(result.hostUrl)}.`,
      );
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("whoami", "Show the current TailorKit CLI authentication scope")
  .option("--config <path>", "Path to tailorkit config")
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    try {
      const result = await runWhoami({
        configPath: options.config as string | undefined,
        cwd: String(options.cwd ?? "."),
      });

      log.info(`Host: ${pc.cyan(result.hostUrl)}`);
      log.info(`Scope: ${pc.cyan(result.scopeId)}`);
      outro("Authenticated.");
    } catch (error) {
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

cli
  .command("deploy", "Build and deploy the TailorKit app")
  .option("--config <path>", "Path to tailorkit config")
  .option("--entry <path>", "Client entry file")
  .option("--out-dir <path>", "Build output directory")
  .option("--mode <mode>", "Vite mode")
  .action(async (options: Record<string, unknown>) => {
    intro(pc.bold("TailorKit"));
    const deploySpinner = spinner();
    try {
      deploySpinner.start("Building and deploying app");
      const result = await runDeploy({
        configPath: options.config as string | undefined,
        cwd: String(options.cwd ?? "."),
        entry: options.entry as string | undefined,
        mode: options.mode as string | undefined,
        onMissingAppId: async ({ appName, configPath, hostUrl }) => {
          deploySpinner.stop("App not linked.");
          log.info(`No appId found in ${pc.cyan(configPath)}.`);
          log.info(`Host: ${pc.cyan(hostUrl)}`);
          const shouldCreate = await confirm({
            initialValue: true,
            message: `Create a TailorKit app named ${appName}?`,
          });

          if (isCancel(shouldCreate)) {
            return false;
          }

          if (shouldCreate) {
            deploySpinner.start("Creating app and deploying");
          }

          return shouldCreate;
        },
        outDir: options.outDir as string | undefined,
      });
      deploySpinner.stop("Deployed app.");
      if (result.createdApp) {
        log.info(`Created app and updated tailorkit.config.ts with ${pc.cyan(result.appId)}.`);
      }
      log.info(`Host: ${pc.cyan(result.hostUrl)}`);
      log.info(`App: ${pc.cyan(result.appId)}`);
      log.info(`Deployment: ${pc.cyan(result.deploymentId)}`);
      log.info("Uploaded files:");
      for (const file of result.uploadedFiles) {
        log.info(
          `  ${pc.cyan(file.path)} ${pc.dim(`${formatBytes(file.size)} raw, ${formatBytes(file.gzipSize)} gzip`)}`,
        );
      }
      if (result.status) {
        log.info(`Status: ${pc.cyan(result.status)}`);
      }
      outro("Deployment published.");
    } catch (error) {
      deploySpinner.stop("Deployment failed.");
      log.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

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
