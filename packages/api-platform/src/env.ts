import * as z from "zod";
import { createEnv } from "@tailorkit/env";

export const env = createEnv(
  "api-platform",
  z.object({
    AUTH_SECRET: z.string().min(32).optional(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    OPENAPI_SERVER_URL: z.url().default("https://tailorkit.dev/api/platform"),
  }),
  import.meta.url,
  ["AUTH_SECRET"],
);
