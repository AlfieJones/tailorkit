import { outro } from "@clack/prompts";
import path from "node:path";
import pc from "picocolors";

export interface ExperimentalSchemaOptions {
  cwd: string;
  filePath: string;
}

interface SchemaLike {
  $internal: { components: unknown; screens: unknown };
  serialize: (schemaSerializer?: (schema: unknown) => Record<string, unknown> | undefined) => unknown;
}

interface TailorKitInstanceLike {
  $internal: { schema: SchemaLike };
}

const isSchemaLike = (value: unknown): value is SchemaLike =>
  value !== null &&
  typeof value === "object" &&
  "serialize" in value &&
  typeof (value as Record<string, unknown>).serialize === "function" &&
  "$internal" in value &&
  (value as Record<string, unknown>).$internal !== null &&
  typeof (value as Record<string, unknown>).$internal === "object";

const isTailorKitInstanceLike = (value: unknown): value is TailorKitInstanceLike =>
  value !== null &&
  typeof value === "object" &&
  "$internal" in value &&
  (value as Record<string, unknown>).$internal !== null &&
  typeof (value as Record<string, unknown>).$internal === "object" &&
  "schema" in ((value as Record<string, unknown>).$internal as Record<string, unknown>) &&
  isSchemaLike(((value as Record<string, unknown>).$internal as Record<string, unknown>).schema);

const hasToJSONSchema = (schema: unknown): schema is { toJSONSchema: () => Record<string, unknown> } =>
  schema !== null &&
  typeof schema === "object" &&
  "toJSONSchema" in schema &&
  typeof (schema as Record<string, unknown>).toJSONSchema === "function";

const tryExtractSchema = (mod: Record<string, unknown>): SchemaLike | undefined => {
  // 1. Named `schema` export
  if (isSchemaLike(mod.schema)) {
    return mod.schema;
  }

  // 2. Default export with `$internal.schema` (tailorKit instance)
  if (isTailorKitInstanceLike(mod.default)) {
    return mod.default.$internal.schema;
  }

  // 3. Default export directly as schema
  if (isSchemaLike(mod.default)) {
    return mod.default;
  }

  // 4. Any other export that looks like a schema
  for (const value of Object.values(mod)) {
    if (isSchemaLike(value)) {
      return value;
    }
    if (isTailorKitInstanceLike(value)) {
      return value.$internal.schema;
    }
  }

  return undefined;
};

export interface TailorKitSchemaFile {
  components?: Record<string, unknown>;
  screens?: Record<string, unknown>;
}

export const loadSchemaFromModule = async (options: { cwd: string; filePath: string }): Promise<TailorKitSchemaFile> => {
  const { cwd, filePath } = options;
  const absoluteCwd = path.resolve(cwd);
  const resolvedPath = new URL(filePath, `file://${absoluteCwd}/`).href;

  let mod: Record<string, unknown>;
  try {
    mod = (await import(resolvedPath)) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Unable to load module at ${filePath}.\n${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const schema = tryExtractSchema(mod);

  if (schema === undefined) {
    const exports = Object.keys(mod).join(", ") || "(none)";
    throw new Error(
      `Could not find a TailorKit schema export in ${filePath}.\nAvailable exports: ${exports}. Expected a \`schema\` export from \`defineSchema()\` or a \`tailorKit()\` instance export.`,
    );
  }

  const schemaSerializer = (s: unknown): Record<string, unknown> | undefined => {
    if (hasToJSONSchema(s)) {
      return s.toJSONSchema();
    }
    return undefined;
  };

  return schema.serialize(schemaSerializer) as TailorKitSchemaFile;
};

export const runExperimentalSchema = async (options: ExperimentalSchemaOptions): Promise<void> => {
  const serialized = await loadSchemaFromModule(options);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(serialized, null, 2));

  outro(pc.green("Schema serialized successfully."));
};
