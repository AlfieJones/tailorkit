import { z } from "zod";
import { componentRecord } from "./component";
import { screenRecord } from "./screen";

const themeTokenRecord = z.record(z.string(), z.string());

const theme = z.object({
  breakpoints: z.record(z.string(), z.string().nullable()).optional(),
  tokens: z
    .object({
      background: themeTokenRecord.optional(),
      border: themeTokenRecord.optional(),
      borderColor: themeTokenRecord.optional(),
      radius: themeTokenRecord.optional(),
      space: themeTokenRecord.optional(),
    })
    .optional(),
});

const actionLeaf = z.object({
  input: z.record(z.string(), z.unknown()).optional(),
  output: z.record(z.string(), z.unknown()).optional(),
});

interface ActionRecord {
  [key: string]: z.infer<typeof actionLeaf> | ActionRecord;
}

const actionRecord: z.ZodType<ActionRecord> = z.lazy(() =>
  z.record(z.string(), z.union([actionLeaf, actionRecord])),
);

export const TailorKitSchemaSpec = z.object({
  version: z.literal(1),
  actions: actionRecord.default({}),
  components: componentRecord,
  screens: screenRecord.default({}),
  theme: theme.optional(),
});

export type TailorKitSchemaSpec = z.infer<typeof TailorKitSchemaSpec>;
