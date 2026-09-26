import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv(
  "api-utils",
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).optional(),
    VERCEL: z.stringbool().optional(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    ASSET_DOMAIN: z.string().default("tailorkit.app"),
    ASSET_BASE_URL: z.url().optional(),
  }),
  import.meta.url,
);
