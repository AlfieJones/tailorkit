import { TailorKitSchemaSpec } from "@tailorkit/spec";
import type { SerializedTailorKitSchema } from "@tailorkit/spec";
import { Hono } from "hono";

import type { ComponentDefinition, SchemaSerializer, TailorKitSchema } from "./config";

type Components = Record<string, ComponentDefinition>;

export interface TailorKitOptions {
  /**
   * Converts validator-specific field and callback schemas to JSON Schema.
   * For Zod v4, pass `(schema) => z.toJSONSchema(schema)`.
   */
  schemaSerializer?: SchemaSerializer;
}

export interface TailorKitProject {
  handler: (request: Request) => Promise<Response>;
}

const createSerializedSchema = <TComponents extends Components>(
  schema: TailorKitSchema<TComponents>,
  { schemaSerializer }: TailorKitOptions,
): SerializedTailorKitSchema => TailorKitSchemaSpec.parse(schema.serialize(schemaSerializer));

const createApi = <TComponents extends Components>(
  schema: TailorKitSchema<TComponents>,
  options: TailorKitOptions,
) => {
  const serializedSchema = createSerializedSchema(schema, options);
  const app = new Hono();

  app.get("/", (context) => context.json(serializedSchema));

  return app;
};

/**
 * Creates a TailorKit project from a schema.
 *
 * The project exposes a fetch-native handler for framework route files. Its
 * root route (`GET /`) returns the serialized TailorKit schema.
 */
export const tailorKit = <TComponents extends Components>(
  schema: TailorKitSchema<TComponents>,
  options: TailorKitOptions = {},
): TailorKitProject => {
  const app = createApi(schema, options);

  return {
    handler: (request) => Promise.resolve(app.fetch(request)),
  };
};
