import { cancel, confirm, isCancel, select, spinner, text } from "@clack/prompts";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";

import {
  createClient,
  createComponentSpec,
  createFallbackScreen,
  createGeneratedFile,
  createGitignore,
  createOxfmtConfig,
  createOxlintConfig,
  createPackageJson,
  createTailorKitConfig,
  createTsconfig,
} from "./templates";
import { resolveTemplatePackageVersions } from "./package-versions";

interface InitOptions {
  cwd: string;
  directory?: string;
  force?: boolean;
  formatting?: boolean;
  install?: boolean;
  linting?: boolean;
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

interface CodeQualitySelection {
  formatting: boolean;
  linting: boolean;
}

const codeQualityChoices = ["all", "linting", "formatting", "none"] as const;

type CodeQualityChoice = (typeof codeQualityChoices)[number];

const isCodeQualityChoice = (value: string): value is CodeQualityChoice =>
  codeQualityChoices.includes(value as CodeQualityChoice);

const resolveCodeQualitySelection = async (
  options: Pick<InitOptions, "formatting" | "linting">,
): Promise<CodeQualitySelection> => {
  if (options.formatting !== undefined || options.linting !== undefined) {
    return {
      formatting: options.formatting ?? true,
      linting: options.linting ?? true,
    };
  }

  const answer = await select({
    initialValue: "all",
    message: "Linting and formatting",
    options: [
      {
        hint: "oxlint and oxfmt",
        label: "Add linting and formatting",
        value: "all",
      },
      {
        hint: "oxlint only",
        label: "Add linting only",
        value: "linting",
      },
      {
        hint: "oxfmt only",
        label: "Add formatting only",
        value: "formatting",
      },
      {
        label: "Skip",
        value: "none",
      },
    ],
  });

  if (isCancel(answer)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  if (!isCodeQualityChoice(answer)) {
    throw new Error("Linting and formatting selection must be all, linting, formatting, or none.");
  }

  return {
    formatting: answer === "all" || answer === "formatting",
    linting: answer === "all" || answer === "linting",
  };
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

const formatProject = async (
  targetDirectory: string,
  packageManager: PackageManager,
): Promise<void> => {
  const s = spinner();
  s.start("Formatting project");

  const process = Bun.spawn([packageManager, "run", "format:fix"], {
    cwd: targetDirectory,
    stderr: "inherit",
    stdout: "inherit",
  });
  const exitCode = await process.exited;

  if (exitCode !== 0) {
    s.stop("Formatting failed.");
    throw new Error(`${packageManager} run format:fix exited with code ${exitCode}.`);
  }

  s.stop("Formatted project.");
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
  const codeQualitySelection = await resolveCodeQualitySelection(options);
  const packageVersions = await resolveTemplatePackageVersions();

  await ensureDirectory(path.join(targetDirectory, "src", "views"));

  await writeFile(
    path.join(targetDirectory, "package.json"),
    createPackageJson({
      formatting: codeQualitySelection.formatting,
      linting: codeQualitySelection.linting,
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
    path.join(targetDirectory, "tailorkit.schema.json"),
    createComponentSpec(),
    force,
  );
  await writeFile(path.join(targetDirectory, "tsconfig.json"), createTsconfig(), force);
  await writeFile(path.join(targetDirectory, ".gitignore"), createGitignore(), force);
  if (codeQualitySelection.linting) {
    await writeFile(path.join(targetDirectory, "oxlint.config.ts"), createOxlintConfig(), force);
  }
  if (codeQualitySelection.formatting) {
    await writeFile(path.join(targetDirectory, "oxfmt.config.ts"), createOxfmtConfig(), force);
  }
  await writeFile(path.join(targetDirectory, "src", "client.ts"), createClient(), force);
  await writeFile(
    path.join(targetDirectory, "src", "views", "fallback.tsx"),
    createFallbackScreen(),
    force,
  );
  await writeFile(
    path.join(targetDirectory, "src", "tailorkit.gen.ts"),
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

    if (codeQualitySelection.formatting) {
      await formatProject(targetDirectory, packageManager);
    }
  }

  return targetDirectory;
};
