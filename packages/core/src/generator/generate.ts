import { Liquid } from "liquidjs";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  clientTemplate,
  fallbackTemplate,
  genTemplate,
  gitignoreTemplate,
  oxfmtConfigTemplate,
  oxlintConfigTemplate,
  packageJsonTemplate,
  tailorkitConfigTemplate,
  tailorkitSchemaTemplate,
  tsconfigTemplate,
} from "./templates/index";

export interface GenerateAppOptions {
  targetDirectory: string;
  force: boolean;
  formatting: boolean;
  linting: boolean;
  packageName: string;
  packageVersions: {
    oxfmt: string;
    oxlint: string;
    preact: string;
    typescript: string;
  };
  useWorkspaceDependencies?: boolean;
}

const engine = new Liquid({ strictVariables: true });

const renderTemplate = (template: string, data: Record<string, unknown>): Promise<string> =>
  engine.parseAndRender(template, data);

const ensureDir = (dir: string): Promise<void> => mkdir(dir, { recursive: true }).then(() => {});

const writeRendered = async (filepath: string, contents: string, force: boolean): Promise<void> => {
  if (!force && existsSync(filepath)) {
    throw new Error(`${filepath} already exists. Use --force to overwrite it.`);
  }
  await writeFile(filepath, contents, "utf-8");
};

export const generateApp = async (options: GenerateAppOptions): Promise<void> => {
  const {
    targetDirectory,
    force,
    formatting,
    linting,
    packageName,
    packageVersions,
    useWorkspaceDependencies,
  } = options;

  const tailorkitVersion = useWorkspaceDependencies ? "workspace:*" : "latest";

  const checkParts: string[] = [];
  const fixParts: string[] = [];
  if (linting) {
    checkParts.push("bun run lint");
    fixParts.push("bun run lint:fix");
  }
  if (formatting) {
    checkParts.push("bun run format");
    fixParts.push("bun run format:fix");
  }

  const data = {
    checkScript: checkParts.join(" && "),
    fixScript: fixParts.join(" && "),
    formatting,
    linting,
    oxfmtVersion: packageVersions.oxfmt,
    oxlintVersion: packageVersions.oxlint,
    packageName,
    preactVersion: packageVersions.preact,
    tailorkitVersion,
    typescriptVersion: packageVersions.typescript,
  };

  await ensureDir(path.join(targetDirectory, "src", "views"));

  const files: { template: string; dest: string; condition?: boolean }[] = [
    { template: packageJsonTemplate, dest: "package.json" },
    { template: tsconfigTemplate, dest: "tsconfig.json" },
    { template: tailorkitConfigTemplate, dest: "tailorkit.config.ts" },
    { template: tailorkitSchemaTemplate, dest: "tailorkit.schema.json" },
    { template: gitignoreTemplate, dest: ".gitignore" },
    { template: oxlintConfigTemplate, dest: "oxlint.config.ts", condition: linting },
    { template: oxfmtConfigTemplate, dest: "oxfmt.config.ts", condition: formatting },
    { template: clientTemplate, dest: path.join("src", "client.ts") },
    { template: fallbackTemplate, dest: path.join("src", "views", "fallback.tsx") },
    { template: genTemplate, dest: path.join("src", "tailorkit.gen.ts") },
  ];

  await Promise.all(
    files
      .filter((f) => f.condition !== false)
      .map(async ({ template, dest }) => {
        const rendered = await renderTemplate(template, data);
        await writeRendered(path.join(targetDirectory, dest), rendered, force);
      }),
  );
};
