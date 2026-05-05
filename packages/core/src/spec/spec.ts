import { z } from "zod";
import { componentRecord } from "./component";
import { screenRecord } from "./screen";

export const TailorKitSchemaSpec = z.object({
  version: z.literal(1),
  components: componentRecord,
  screens: screenRecord.default({}),
});

export type TailorKitSchemaSpec = z.infer<typeof TailorKitSchemaSpec>;
