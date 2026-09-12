import { z } from "zod";
import { componentRecord } from "./component";
import { screenRecord } from "./screen";

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

export const TailorKitSchemaSpec = z
  .object({
    version: z.literal(1),
    viewports: z
      .record(z.string().min(1), z.object({ scopes: z.array(z.string().startsWith("/")) }))
      .default({}),
    actions: actionRecord.default({}),
    components: componentRecord,
    scopes: screenRecord.default({}),
  })
  .superRefine((schema, ctx) => {
    for (const [name, viewport] of Object.entries(schema.viewports)) {
      viewport.scopes.forEach((scope, index) => {
        if (!Object.hasOwn(schema.scopes, scope)) {
          ctx.addIssue({
            code: "custom",
            path: ["viewports", name, "scopes", index],
            message: `Unknown scope "${scope}".`,
          });
        }
      });
    }
  });

export type TailorKitSchemaSpec = z.infer<typeof TailorKitSchemaSpec>;
