import { z } from "zod";
import { JsonSchema } from "./json-schema";

const screenPathPattern =
  /^\/(?:(?:[A-Za-z0-9_-]+|:[A-Za-z][A-Za-z0-9_-]*)(?:\/(?:[A-Za-z0-9_-]+|:[A-Za-z][A-Za-z0-9_-]*))*)?$/u;

const ScreenPath = z.string().regex(screenPathPattern, {
  message:
    'Screen paths must be "/" or slash-separated literal and parameter segments like "/settings" or "/:org-slug/projects/:project-slug".',
});

type ScreenPath = z.infer<typeof ScreenPath>;

const SerializedScreen = z
  .object({
    context: JsonSchema.optional(),
  })
  .strict();

export const screenRecord = z.record(ScreenPath, SerializedScreen);
