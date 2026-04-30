import { cancel, confirm, isCancel, text } from "@clack/prompts";
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

interface InitOptions {
  cwd: string;
  directory?: string;
  force?: boolean;
  name?: string;
}

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

export const initApp = async (options: InitOptions): Promise<string> => {
  const directoryAnswer =
    options.directory ??
    (await text({
      defaultValue: ".",
      message: "Where should the sandbox app be created?",
      placeholder: ".",
    }));

  if (isCancel(directoryAnswer)) {
    cancel("Init cancelled.");
    process.exit(0);
  }

  const targetDirectory = path.resolve(options.cwd, directoryAnswer);
  const defaultPackageName =
    normalizePackageName(path.basename(targetDirectory)) || "tailorkit-app";
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

  await ensureDirectory(path.join(targetDirectory, "src"));

  await writeFile(
    path.join(targetDirectory, "package.json"),
    createPackageJson({ packageName }),
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

  return targetDirectory;
};
