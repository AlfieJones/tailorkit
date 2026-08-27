import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const publishablePackages = [
  "packages/tailorkit/package.json",
  "packages/app/package.json",
  "packages/cli/package.json",
  "packages/client-platform/package.json",
  "packages/core/package.json",
  "packages/react/package.json",
  "packages/sandbox/package.json",
];

function run(command, args, captureOutput = false) {
  const result = spawnSync(command, args, {
    encoding: "utf-8",
    stdio: captureOutput ? ["ignore", "pipe", "inherit"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout ?? "";
}

export async function normalizePrereleasePackages(preState, runCommand = run) {
  if (preState.mode !== "pre" || !["alpha", "beta"].includes(preState.tag)) {
    console.error("Refusing to normalize packages outside the alpha or beta channels.");
    process.exit(1);
  }

  for (const manifestPath of publishablePackages) {
    const { name, version } = JSON.parse(await readFile(manifestPath, "utf-8"));

    if (name.startsWith("@")) {
      runCommand("npm", ["access", "set", "status=public", name]);
    }

    const distTags = JSON.parse(runCommand("npm", ["view", name, "dist-tags", "--json"], true));

    if (distTags[preState.tag] !== version) {
      runCommand("npm", ["dist-tag", "add", `${name}@${version}`, preState.tag]);
    }

    if (distTags.latest === version) {
      runCommand("npm", ["dist-tag", "rm", name, "latest"]);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const preState = JSON.parse(await readFile(".changeset/pre.json", "utf-8"));
  await normalizePrereleasePackages(preState);
}
