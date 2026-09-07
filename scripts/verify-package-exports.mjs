import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const packagesDirectory = new URL("../packages/", import.meta.url);
const npmCache = mkdtempSync(join(tmpdir(), "tailorkit-npm-pack-"));
const failures = [];

const collectTargets = (value) => {
  if (typeof value === "string") {
    return value.startsWith("./") ? [value.slice(2)] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectTargets);
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectTargets);
  }
  return [];
};

const matchesTarget = (files, target) => {
  if (!target.includes("*")) {
    return files.has(target);
  }
  const pattern = new RegExp(
    `^${target
      .split("*")
      .map((part) => part.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".+")}$`,
  );
  return [...files].some((file) => pattern.test(file));
};

try {
  for (const directory of readdirSync(packagesDirectory, { withFileTypes: true })) {
    if (!directory.isDirectory()) {
      continue;
    }

    const packageDirectory = new URL(`${directory.name}/`, packagesDirectory);
    let packageJson;
    try {
      packageJson = JSON.parse(readFileSync(new URL("package.json", packageDirectory), "utf-8"));
    } catch {
      continue;
    }
    if (packageJson.private || !packageJson.publishConfig) {
      continue;
    }

    const result = JSON.parse(
      execFileSync("npm", ["pack", "--dry-run", "--json"], {
        cwd: packageDirectory,
        encoding: "utf-8",
        env: { ...process.env, npm_config_cache: npmCache },
      }),
    );
    const files = new Set(result[0].files.map(({ path }) => path));
    const targets = collectTargets(packageJson.exports);

    for (const target of targets) {
      if (!matchesTarget(files, target)) {
        failures.push(
          `${packageJson.name}: export target ${target} is missing from its npm package`,
        );
      }
    }
  }
} finally {
  rmSync(npmCache, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("All published export targets are present in their npm packages.");
}
