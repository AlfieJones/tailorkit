import { z } from "zod";

/**
 * Models the exact JSON Schema 2020-12 subset emitted by `z.toJSONSchema()`.
 * Strict — unknown keys (including `x-` extensions) are rejected.
 * We're being strict just so we know exactly what we're dealing with. If we need
 * to support additional schema features, we can add them incrementally.
 *
 */
const JsonSchema: z.ZodType<Record<string, unknown>> = z
  .object({
    $schema: z.string().optional(),
    type: z.union([z.string(), z.array(z.string())]).optional(),
    properties: z.lazy(() => z.record(z.string(), JsonSchema)).optional(),
    required: z.array(z.string()).optional(),
    additionalProperties: z.union([z.boolean(), z.lazy(() => JsonSchema)]).optional(),
    enum: z.array(z.unknown()).optional(),
    const: z.unknown().optional(),
    items: z.lazy(() => JsonSchema).optional(),
    anyOf: z.lazy(() => z.array(JsonSchema)).optional(),
  })
  .strict();

const SerializedCallback = z.object({
  async: z.boolean().optional(),
  input: z.array(JsonSchema).optional(),
  output: JsonSchema.optional(),
});

const SerializedNativeEvent = z.object({
  element: z.string(),
  name: z.string(),
  input: z.array(JsonSchema).optional(),
});

const SerializedComponent = z.object({
  /** Ordered list of all field keys, including those inherited from presets. */
  fieldKeys: z.array(z.string()),
  callbacks: z.record(z.string(), SerializedCallback),
  slots: z.array(z.string()),
  nativeEvents: z.record(z.string(), SerializedNativeEvent),
});

const screenPathPattern =
  /^\/(?:(?:[A-Za-z0-9_-]+|:[A-Za-z][A-Za-z0-9_-]*)(?:\/(?:[A-Za-z0-9_-]+|:[A-Za-z][A-Za-z0-9_-]*))*)?$/u;

const ScreenPath = z.string().regex(screenPathPattern, {
  message:
    'Screen paths must be "/" or slash-separated literal and parameter segments like "/settings" or "/:org-slug/projects/:project-slug".',
});

const SerializedScreen = z
  .object({
    context: JsonSchema.optional(),
  })
  .strict();

export const TailorKitSchemaSpec = z.object({
  version: z.literal(1),
  components: z.record(z.string(), SerializedComponent),
  defaultContext: JsonSchema.optional(),
  screens: z.record(ScreenPath, SerializedScreen).default({}),
});

export type SerializedCallbackDefinition = z.infer<typeof SerializedCallback>;
export type SerializedNativeEventDefinition = z.infer<typeof SerializedNativeEvent>;
export type SerializedComponentDefinition = z.infer<typeof SerializedComponent>;
export type SerializedScreenDefinition = z.infer<typeof SerializedScreen>;
export type SerializedTailorKitSchema = z.infer<typeof TailorKitSchemaSpec>;
