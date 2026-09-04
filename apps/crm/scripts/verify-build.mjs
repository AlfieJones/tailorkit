import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";

const output = new URL("../.vercel/output/", import.meta.url);
const config = JSON.parse(await readFile(new URL("config.json", output), "utf-8"));
assert.equal(config.version, 3, "CRM must emit Vercel Build Output API v3.");
await access(new URL("functions/__server.func/.vc-config.json", output));
for (const app of ["stripe-revenue", "renewal-coach"]) {
  await access(new URL(`static/apps/${app}.js`, output));
}

const assets = await readdir(new URL("static/assets/", output));
const appBundles = assets.filter((name) => name.startsWith("crm-app-") && name.endsWith(".js"));
assert.ok(appBundles.length > 0, "CRM client bundle is missing.");
const workers = new Set();
for (const bundle of appBundles) {
  const source = await readFile(new URL(`static/assets/${bundle}`, output), "utf-8");
  for (const match of source.matchAll(/\/assets\/(worker-[\w-]+\.js)/gu)) {
    workers.add(match[1]);
  }
}
assert.ok(workers.size > 0, "CRM must reference a bundled sandbox worker.");
for (const worker of workers) {
  await access(new URL(`static/assets/${worker}`, output));
}
console.log("Verified Vercel server, demo apps, and sandbox worker assets.");
