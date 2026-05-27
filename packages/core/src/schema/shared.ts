import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

export type Schema = StandardSchemaV1 & StandardJSONSchemaV1;
export type EmptyObject = unknown;
export type MaybePromise<T> = T | Promise<T>;

export type InferSchema<TSchema> = TSchema extends StandardSchemaV1
  ? StandardSchemaV1.InferOutput<TSchema>
  : EmptyObject;

export type MergeProps<TBase, TOverride> = Omit<TBase, keyof TOverride> & TOverride;

export type SchemaSerializer = (schema: Schema) => Record<string, unknown> | undefined;

export const jsonSchemaSerializer: SchemaSerializer = (schema) =>
  schema["~standard"].jsonSchema.output({ target: "draft-2020-12" });

export const serializeSchema = (
  schema: Schema | undefined,
  schemaSerializer: SchemaSerializer | undefined,
): Record<string, unknown> | undefined =>
  schema === undefined || schemaSerializer === undefined ? undefined : schemaSerializer(schema);
