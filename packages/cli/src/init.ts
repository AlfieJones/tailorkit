import { cancel, confirm, isCancel, select, spinner, text } from "@clack/prompts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

import {
  createApp,
  createComponentSpec,
  createGeneratedFile,
  createMain,
  createPackageJson,
  createTailorKitConfig,
  createTsconfig,
} from "./templates";
import { resolveTemplatePackageVersions } from "./package-versions";

interface InitOptions {
  cwd: string;
  directory?: string;
  force?: boolean;
  install?: boolean;
  name?: string;
  packageManager?: string;
  useWorkspaceDependencies?: boolean;
}

const packageManagers = ["bun", "yarn", "pnpm", "npm"] as const;

type PackageManager = (typeof packageManagers)[number];

const ensureDirectory = async (directory: string): Promise<void> => {
  await mkdir(directory, { recursive: true });
};

const writeFile = async (filepath: string, contents: string, force: boolean): Promise<void> => {
  if (!force && existsSync(filepath)) {
    throw new Error(`${filepath} already exists. Use --force to overwrite it.`);
  }

  await Bun.write(filepath, contents);
};

const normalizePackageName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9._/-]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");

const isPackageManager = (value: string): value is PackageManager =>
  packageManagers.includes(value as PackageManager);

const resolvePackageManager = async (
  packageManager: string | undefined,
): Promise<PackageManager> => {
  if (packageManager !== undefined) {
    if (isPackageManager(packageManager)) {
      return packageManager;
    }

    throw new Error("--package-manager must be one of bun, yarn, pnpm, or npm.");
  }

  const answer = await select({
    initialValue: "bun",
    message: "Package manager",
    options: packageManagers.map((value) => ({
      label: value,
      value,
    })),
  });

  if (isCancel(answer)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  if (isPackageManager(answer)) {
    return answer;
  }

  throw new Error("--package-manager must be one of bun, yarn, pnpm, or npm.");
};

const installDependencies = async (
  targetDirectory: string,
  packageManager: PackageManager,
): Promise<void> => {
  const s = spinner();
  s.start(`Installing dependencies with ${packageManager}`);

  const process = Bun.spawn([packageManager, "install"], {
    cwd: targetDirectory,
    stderr: "inherit",
    stdout: "inherit",
  });
  const exitCode = await process.exited;

  if (exitCode !== 0) {
    s.stop("Dependency install failed.");
    throw new Error(`${packageManager} install exited with code ${exitCode}.`);
  }

  s.stop("Installed dependencies.");
};

export const initApp = async (options: InitOptions): Promise<string> => {
  const directoryAnswer = options.directory ?? ".";

  if (isCancel(directoryAnswer)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  const baseDirectory = path.resolve(options.cwd, directoryAnswer);
  const defaultPackageName = normalizePackageName(path.basename(baseDirectory)) || "tailorkit-app";
  const nameAnswer =
    options.name ??
    (await text({
      defaultValue: defaultPackageName,
      message: "Package name",
      placeholder: defaultPackageName,
      validate: (value) =>
        normalizePackageName(value ?? "").length === 0 ? "Enter a package name." : undefined,
    }));

  if (isCancel(nameAnswer)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  const packageName = normalizePackageName(nameAnswer);
  const targetDirectory = path.join(baseDirectory, packageName);

  let force = options.force ?? false;

  if (existsSync(targetDirectory) && !force) {
    const shouldOverwrite = await confirm({
      initialValue: false,
      message: `${pc.cyan(targetDirectory)} already exists. Overwrite matching files?`,
    });

    if (isCancel(shouldOverwrite) || !shouldOverwrite) {
      cancel("Init cancelled.");
      process.exit(0);
    }

    force = true;
  }

  const packageManager = await resolvePackageManager(options.packageManager);
  const packageVersions = await resolveTemplatePackageVersions();

  await ensureDirectory(path.join(targetDirectory, "src"));

  await writeFile(
    path.join(targetDirectory, "package.json"),
    createPackageJson({
      packageName,
      packageVersions,
      useWorkspaceDependencies: options.useWorkspaceDependencies,
    }),
    force,
  );
  await writeFile(
    path.join(targetDirectory, "tailorkit.config.ts"),
    createTailorKitConfig(),
    force,
  );
  await writeFile(
    path.join(targetDirectory, "tailorkit.components.json"),
    createComponentSpec(),
    force,
  );
  await writeFile(path.join(targetDirectory, "tsconfig.json"), createTsconfig(), force);
  await writeFile(path.join(targetDirectory, "src", "app.tsx"), createApp(), force);
  await writeFile(path.join(targetDirectory, "src", "main.tsx"), createMain(), force);
  await writeFile(
    path.join(targetDirectory, "src", "tailorkit.generated.tsx"),
    createGeneratedFile(),
    force,
  );

  const shouldInstall =
    options.install ??
    (await confirm({
      initialValue: true,
      message: "Install dependencies?",
    }));

  if (isCancel(shouldInstall)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  if (shouldInstall) {
    await installDependencies(targetDirectory, packageManager);
  }

  return targetDirectory;
};
