import { z } from "zod";
import { JsonSchema } from "./json-schema";

const screenKeyPattern = /^[A-Za-z][A-Za-z0-9_-]*$/u;

const ScreenKey = z.string().regex(screenKeyPattern, {
  message: 'Screen keys must start with a letter and contain only letters, numbers, "_", or "-".',
});

type ScreenKey = z.infer<typeof ScreenKey>;

const SerializedScreen = z
  .object({
    context: JsonSchema.optional(),
  })
  .strict();

export const screenRecord = z.record(ScreenKey, SerializedScreen);
