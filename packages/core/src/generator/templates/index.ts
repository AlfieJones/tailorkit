import packageJsonTemplate from "./package.json.liquid";
import tsconfigTemplate from "./tsconfig.json.liquid";
import tailorkitConfigTemplate from "./tailorkit.config.ts.liquid";
import tailorkitSchemaTemplate from "./tailorkit.schema.json.liquid";
import gitignoreTemplate from "./.gitignore.liquid";
import oxlintConfigTemplate from "./oxlint.config.ts.liquid";
import oxfmtConfigTemplate from "./oxfmt.config.ts.liquid";
import clientTemplate from "./src/client.ts.liquid";
import fallbackTemplate from "./src/views/fallback.tsx.liquid";
import genTemplate from "./src/tailorkit.gen.ts.liquid";

export {
  packageJsonTemplate,
  tsconfigTemplate,
  tailorkitConfigTemplate,
  tailorkitSchemaTemplate,
  gitignoreTemplate,
  oxlintConfigTemplate,
  oxfmtConfigTemplate,
  clientTemplate,
  fallbackTemplate,
  genTemplate,
};
