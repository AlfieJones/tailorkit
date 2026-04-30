import type { AttributeSchema } from "./globals";
import { createSchema } from "./globals";

export const labelSchema = createSchema<HTMLLabelElement>("label", {
  for: { types: [{ type: "string" }], reactKey: "htmlFor" } satisfies AttributeSchema,
});
