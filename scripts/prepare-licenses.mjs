import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const licensesDir = path.join(root, "licenses");

const packageDirs = fs
  .readdirSync(path.join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(root, "packages", entry.name));

for (const packageDir of packageDirs) {
  const manifestPath = path.join(packageDir, "package.json");
  if (!fs.existsSync(manifestPath)) {
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  if (manifest.private || !manifest.license) {
    continue;
  }

  const source = path.join(licensesDir, `${manifest.license}.txt`);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing canonical license text for ${manifest.name}: ${source}`);
  }

  fs.copyFileSync(source, path.join(packageDir, "LICENSE"));
  console.log(`Prepared ${manifest.name} (${manifest.license})`);
}
