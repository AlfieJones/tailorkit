import * as z from "zod";
import { createEnv, warnIfMissing } from "@tailorkit/env";

export const env = createEnv(
  "email",
  z.object({
    EMAIL_FROM: z.string().min(1).optional(),
    EMAIL_FROM_AUTH: z.string().min(1).optional(),
    EMAIL_FROM_INVITE: z.string().min(1).optional(),
    EMAIL_REPLY_TO: z.string().min(1).optional(),
    EMAIL_PROVIDER: z.enum(["ses", "smtp"]).optional(),
    EMAIL_SMTP_URL: z.string().min(1).optional(),
    EMAIL_ACCESS_KEY_ID: z.string().min(1).optional(),
    EMAIL_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    EMAIL_REGION: z.string().min(1).optional(),
    VERCEL_ENV: z.string().optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  }),
  import.meta.url,
  ["EMAIL_FROM", "EMAIL_PROVIDER"],
);

if (env.EMAIL_PROVIDER === "smtp") {
  warnIfMissing("email", { EMAIL_SMTP_URL: env.EMAIL_SMTP_URL });
}
if (env.EMAIL_PROVIDER === "ses") {
  warnIfMissing("email", {
    EMAIL_ACCESS_KEY_ID: env.EMAIL_ACCESS_KEY_ID,
    EMAIL_SECRET_ACCESS_KEY: env.EMAIL_SECRET_ACCESS_KEY,
  });
}
