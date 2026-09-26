import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv(
  "demo",
  z.object({ TAILORKIT_PLATFORM_BASE_URL: z.url().optional() }),
  import.meta.url,
);
