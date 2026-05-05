import { cancel, confirm, isCancel, select, spinner, text } from "@clack/prompts";
import { generateApp, resolveTemplatePackageVersions } from "@tailorkit/core/generator";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import pc from "picocolors";

export interface InitOptions {
  cwd: string;
  directory?: string;
  force?: boolean;
  formatting?: boolean;
  install?: boolean;
  linting?: boolean;
  name?: string;
  packageManager?: string;
}

const PACKAGE_MANAGERS = ["bun", "yarn", "pnpm", "npm"] as const;
type PackageManager = (typeof PACKAGE_MANAGERS)[number];

const isPackageManager = (v: string): v is PackageManager =>
  PACKAGE_MANAGERS.includes(v as PackageManager);

const normalizePackageName = (v: string): string =>
  v
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9._/-]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");

const abortIfCancelled = <T>(v: T | symbol): T => {
  if (isCancel(v)) {
    cancel("Init cancelled.");
    process.exit(0);
  }
  return v as T;
};

const promptDirectory = async (given: string | undefined, cwd: string): Promise<string> => {
  if (given !== undefined) {
    return path.resolve(cwd, given);
  }
  const answer = abortIfCancelled(
    await text({ message: "Where should we create your app?", placeholder: "." }),
  );
  return path.resolve(cwd, answer || ".");
};

const promptPackageName = async (given: string | undefined, baseDir: string): Promise<string> => {
  const defaultName = normalizePackageName(path.basename(baseDir)) || "tailorkit-app";
  if (given !== undefined) {
    return normalizePackageName(given);
  }
  const answer = abortIfCancelled(
    await text({
      defaultValue: defaultName,
      message: "Package name",
      placeholder: defaultName,
      validate: (v) =>
        normalizePackageName(v ?? "").length === 0 ? "Enter a package name." : undefined,
    }),
  );
  return normalizePackageName(answer);
};

const promptPackageManager = async (given: string | undefined): Promise<PackageManager> => {
  if (given !== undefined) {
    if (isPackageManager(given)) {
      return given;
    }
    throw new Error(`--package-manager must be one of: ${PACKAGE_MANAGERS.join(", ")}.`);
  }
  const answer = abortIfCancelled(
    await select({
      message: "Package manager",
      options: PACKAGE_MANAGERS.map((v) => ({ label: v, value: v })),
      initialValue: "bun" as PackageManager,
    }),
  );
  return answer as PackageManager;
};

const promptLinting = async (given: boolean | undefined): Promise<boolean> => {
  if (given !== undefined) {
    return given;
  }
  return abortIfCancelled(
    await confirm({ message: "Add linting with oxlint?", initialValue: true }),
  ) as boolean;
};

const promptFormatting = async (given: boolean | undefined): Promise<boolean> => {
  if (given !== undefined) {
    return given;
  }
  return abortIfCancelled(
    await confirm({ message: "Add formatting with oxfmt?", initialValue: true }),
  ) as boolean;
};

const promptInstall = async (given: boolean | undefined): Promise<boolean> => {
  if (given !== undefined) {
    return given;
  }
  return abortIfCancelled(
    await confirm({ message: "Install dependencies?", initialValue: true }),
  ) as boolean;
};

const promptForce = async (targetDir: string, given: boolean): Promise<boolean> => {
  if (given || !existsSync(targetDir)) {
    return given;
  }
  return abortIfCancelled(
    await confirm({
      message: `${pc.cyan(targetDir)} already exists. Overwrite matching files?`,
      initialValue: false,
    }),
  ) as boolean;
};

const exec = (cmd: string, args: string[], cwd: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: "inherit" });
    proc.on("close", resolve);
    proc.on("error", reject);
  });

const runInstall = async (targetDir: string, pm: PackageManager): Promise<void> => {
  const s = spinner();
  s.start(`Installing dependencies with ${pm}`);
  const code = await exec(pm, ["install"], targetDir);
  if (code !== 0) {
    s.stop("Install failed.");
    throw new Error(`${pm} install exited with code ${code}.`);
  }
  s.stop("Installed dependencies.");
};

const runFormat = async (targetDir: string, pm: PackageManager): Promise<void> => {
  const s = spinner();
  s.start("Formatting project");
  const code = await exec(pm, ["run", "format:fix"], targetDir);
  if (code !== 0) {
    s.stop("Formatting failed.");
    throw new Error(`${pm} run format:fix exited with code ${code}.`);
  }
  s.stop("Formatted project.");
};

export const runInit = async (options: InitOptions): Promise<string> => {
  const baseDir = await promptDirectory(options.directory, options.cwd);
  const packageName = await promptPackageName(options.name, baseDir);
  const targetDirectory = path.join(baseDir, packageName);

  const force = await promptForce(targetDirectory, options.force ?? false);
  const packageManager = await promptPackageManager(options.packageManager);
  const linting = await promptLinting(options.linting);
  const formatting = await promptFormatting(options.formatting);
  const install = await promptInstall(options.install);

  const s = spinner();
  s.start("Resolving package versions");
  const packageVersions = await resolveTemplatePackageVersions();
  s.stop("Resolved package versions.");

  await mkdir(targetDirectory, { recursive: true });

  await generateApp({ targetDirectory, force, linting, formatting, packageName, packageVersions });

  if (install) {
    await runInstall(targetDirectory, packageManager);
    if (formatting) {
      await runFormat(targetDirectory, packageManager);
    }
  }

  return targetDirectory;
};
