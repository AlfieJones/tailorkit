import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { normalizePrereleasePackages } from "./normalize-prerelease.mjs";

const preState = JSON.parse(await readFile(".changeset/pre.json", "utf-8"));

if (preState.mode !== "pre" || !["alpha", "beta"].includes(preState.tag)) {
  console.error("Refusing to publish outside the alpha or beta channels.");
  process.exit(1);
}

const result = spawnSync("vp", ["exec", "changeset", "publish"], { stdio: "inherit" });

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await normalizePrereleasePackages(preState);
