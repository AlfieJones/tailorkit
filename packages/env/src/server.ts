import { config } from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

config({
  path: ["../../apps/web/.env.local", "../../apps/web/.env"],
});

const hasSmtpTransport = (values: { SMTP_URL?: string }) => Boolean(values.SMTP_URL);

const hasSesTransport = (values: {
  AWS_ACCESS_KEY_ID?: string;
  AWS_ROLE_ARN?: string;
  AWS_SECRET_ACCESS_KEY?: string;
}) => Boolean(values.AWS_ROLE_ARN || (values.AWS_ACCESS_KEY_ID && values.AWS_SECRET_ACCESS_KEY));

export const env = createEnv({
  createFinalSchema: (shape) =>
    z.object(shape).superRefine((values, context) => {
      if (hasSmtpTransport(values) || hasSesTransport(values)) {
        return;
      }

      context.addIssue({
        code: "custom",
        message:
          "Email transport requires SMTP_URL or SES credentials via AWS_ROLE_ARN or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
        path: ["SMTP_URL"],
      });
    }),
  emptyStringAsUndefined: true,
  extends: [vercel()],
  runtimeEnv: process.env,
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(32)
        : z.string().min(32).default("some-very-secure-secret"),
    AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
    AWS_DEFAULT_REGION: z.string().min(1).optional(),
    AWS_REGION: z.string().min(1).optional(),
    AWS_ROLE_ARN: z.string().min(1).optional(),
    AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.number().optional(),
    SMTP_FROM: z.string().min(1),
    SMTP_FROM_AUTH: z.string().min(1).optional(),
    SMTP_FROM_INVITE: z.string().min(1).optional(),
    SMTP_REPLY_TO: z.string().min(1).optional(),
    SMTP_URL: z.string().min(1).optional(),
    // POLAR_ACCESS_TOKEN: z.string().min(1),
    // POLAR_SUCCESS_URL: z.url(),
  },
});

export function getBaseUrl() {
  if (env.VERCEL_ENV === "production") {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_ENV === "preview") {
    return `https://${env.VERCEL_URL}`;
  }

  return `http://localhost:${env.PORT ?? 3000}`;
}
