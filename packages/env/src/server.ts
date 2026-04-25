import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  extends: [vercel()],
  runtimeEnv: process.env,
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    RESEND_API_KEY: z.string().min(1),
    // POLAR_ACCESS_TOKEN: z.string().min(1),
    // POLAR_SUCCESS_URL: z.url(),
  },
});
