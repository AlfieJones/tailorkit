import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv(
  "example-nextjs",
  z.object({
    TAILORKIT_ASSETS_BASE_URL: z.url().default("http://localhost:8333/tailorkit"),
    TAILORKIT_PROJECT_KEY: z.string().min(1).optional(),
    TAILORKIT_PLATFORM_BASE_URL: z.url().default("http://localhost:3000/api/platform"),
  }),
  import.meta.url,
  ["TAILORKIT_PROJECT_KEY"],
);
