import { z } from "zod";
import { JsonSchema } from "./json-schema";

const screenKeyPattern = /^\/.*$/u;

const ScreenKey = z.string().regex(screenKeyPattern, {
  message: 'Screen keys must start with "/".',
});

type ScreenKey = z.infer<typeof ScreenKey>;

const SerializedScreen = z
  .object({
    context: JsonSchema.optional(),
  })
  .strict();

export const screenRecord = z.record(ScreenKey, SerializedScreen);
