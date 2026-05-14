import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

const outputPath = resolve(process.cwd(), process.argv[2] ?? "openapi.json");
const serverUrl = process.env.OPENAPI_SERVER_URL ?? "https://tailorkit.dev/api/platform";

Object.assign(process.env, {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://openapi:openapi@localhost:5432/openapi",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "openapi@example.com",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? "smtp",
  EMAIL_SMTP_URL: process.env.EMAIL_SMTP_URL ?? "smtp://localhost:1025",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN ?? "openapi",
});

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

const { platformRouter } = await import("../src/index");

const spec = await generator.generate(platformRouter, {
  info: {
    title: "Tailorkit Platform API",
    version: "0.0.0",
  },
  servers: [{ url: serverUrl }],
});

spec.paths = Object.fromEntries(
  Object.entries(spec.paths).map(([path, pathItem]) => [
    path.replaceAll(/:([A-Za-z_][A-Za-z0-9_]*)/gu, "{$1}"),
    pathItem,
  ]),
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`OpenAPI specification written to ${outputPath}`);
