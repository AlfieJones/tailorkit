import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import type * as z from "zod";

type EnvShape = z.ZodRawShape;

const reportedWarnings = new Set<string>();

function findWorkspaceRoot(startDirectory: string): string | undefined {
  let directory = startDirectory;

  while (true) {
    if (existsSync(resolve(directory, "pnpm-workspace.yaml"))) {
      return directory;
    }

    const parentDirectory = dirname(directory);
    if (parentDirectory === directory) {
      return undefined;
    }

    directory = parentDirectory;
  }
}

function findPackageRoot(startDirectory: string, workspaceRoot: string): string {
  let directory = startDirectory;

  while (directory.startsWith(workspaceRoot)) {
    if (existsSync(resolve(directory, "package.json"))) {
      return directory;
    }

    const parentDirectory = dirname(directory);
    if (parentDirectory === directory || parentDirectory === workspaceRoot) {
      break;
    }

    directory = parentDirectory;
  }

  return startDirectory;
}

function readEnvironment(moduleUrl: string): Record<string, string | undefined> {
  const moduleDirectory = dirname(fileURLToPath(moduleUrl));
  const workspaceRoot =
    findWorkspaceRoot(moduleDirectory) ?? findWorkspaceRoot(process.cwd()) ?? process.cwd();
  const modulePackageRoot = findPackageRoot(moduleDirectory, workspaceRoot);
  const workingPackageRoot = findPackageRoot(process.cwd(), workspaceRoot);
  const packageRoot =
    modulePackageRoot === moduleDirectory ? workingPackageRoot : modulePackageRoot;
  const webRoot = resolve(workspaceRoot, "apps/web");
  const dotenvFiles = [
    resolve(workspaceRoot, ".env"),
    resolve(webRoot, ".env"),
    resolve(packageRoot, ".env"),
    resolve(workspaceRoot, ".env.local"),
    resolve(webRoot, ".env.local"),
    resolve(packageRoot, ".env.local"),
  ];

  const fileValues: Record<string, string> = {};
  for (const filePath of new Set(dotenvFiles)) {
    if (existsSync(filePath)) {
      Object.assign(fileValues, parse(readFileSync(filePath)));
    }
  }

  // Platform and shell variables take precedence over local dotenv files.
  return { ...fileValues, ...process.env };
}

function warn(scope: string, message: string): void {
  const key = `${scope}:${message}`;
  if (reportedWarnings.has(key)) {
    return;
  }

  reportedWarnings.add(key);
  console.warn(`[env:${scope}] ${message}`);
}

export function createEnv<const T extends EnvShape>(
  scope: string,
  schema: z.ZodObject<T>,
  moduleUrl: string,
  required: readonly (keyof T & string)[] = [],
): Partial<z.output<z.ZodObject<T>>> {
  const source = readEnvironment(moduleUrl);
  const requiredNames = new Set<string>(required);
  const parsedValues: Record<string, unknown> = {};

  for (const [name, validator] of Object.entries(schema.shape)) {
    const rawValue = source[name] === "" ? undefined : source[name];
    const parsed = validator.safeParse(rawValue);

    if (rawValue === undefined && requiredNames.has(name)) {
      warn(scope, `Missing ${name}. Add it to a local .env file or the deployment environment.`);
    }

    if (!parsed.success) {
      continue;
    }

    if (parsed.data !== undefined) {
      parsedValues[name] = parsed.data;
    }
  }

  return parsedValues as Partial<z.output<z.ZodObject<T>>>;
}

export function warnIfMissing(scope: string, values: Record<string, unknown>): void {
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined || value === "") {
      warn(scope, `Missing ${name}. Add it to a local .env file or the deployment environment.`);
    }
  }
}

export function resolveProductionUrl(values: {
  AUTH_PRODUCTION_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}) {
  let value = values.AUTH_PRODUCTION_URL;
  if (!value && values.VERCEL_PROJECT_PRODUCTION_URL) {
    value = `https://${values.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (!value) {
    return;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return;
    }
    return url.href.replace(/\/$/u, "");
  } catch {
    return;
  }
}

export function getProductionUrl(values: {
  AUTH_PRODUCTION_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}) {
  return resolveProductionUrl(values);
}

export function getBaseUrl(values: {
  PORT?: number;
  VERCEL_ENV?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
}): string {
  if (values.VERCEL_ENV === "production" && values.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${values.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (values.VERCEL_ENV === "preview" && values.VERCEL_URL) {
    return `https://${values.VERCEL_URL}`;
  }

  return `http://localhost:${values.PORT ?? 3000}`;
}

export function getTrustedOrigins(values: {
  AUTH_TRUSTED_ORIGINS?: string;
  PORT?: number;
  VERCEL_ENV?: string;
  VERCEL_BRANCH_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
}): string[] {
  const origins = new Set([getBaseUrl(values)]);

  for (const origin of values.AUTH_TRUSTED_ORIGINS?.split(",") ?? []) {
    const trimmedOrigin = origin.trim().replace(/\/$/u, "");
    if (trimmedOrigin) {
      origins.add(trimmedOrigin);
    }
  }

  if (values.VERCEL_ENV === "production" && values.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${values.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  if (values.VERCEL_ENV === "preview") {
    if (values.VERCEL_BRANCH_URL) {
      origins.add(`https://${values.VERCEL_BRANCH_URL}`);
    }
    if (values.VERCEL_URL) {
      origins.add(`https://${values.VERCEL_URL}`);
    }
  }

  return [...origins];
}
