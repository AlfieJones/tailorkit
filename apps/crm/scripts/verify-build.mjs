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
assert.ok(
  assets.some((name) => name.startsWith("crm-app-") && name.endsWith(".js")),
  "CRM client bundle is missing.",
);
console.log("Verified Vercel server, demo apps, and client assets.");
