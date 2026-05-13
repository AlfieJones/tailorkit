import { config } from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { vercel } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

config({
  path: ["../../apps/web/.env.local", "../../apps/web/.env"],
});

export const env = createEnv({
  createFinalSchema: (shape) =>
    z.object(shape).superRefine((values, context) => {
      if (values.EMAIL_PROVIDER === "smtp" && !values.EMAIL_SMTP_URL) {
        context.addIssue({
          code: "custom",
          message: "SMTP email requires EMAIL_SMTP_URL.",
          path: ["EMAIL_SMTP_URL"],
        });
      }

      if (
        values.EMAIL_PROVIDER === "ses" &&
        !(values.EMAIL_ACCESS_KEY_ID && values.EMAIL_SECRET_ACCESS_KEY)
      ) {
        context.addIssue({
          code: "custom",
          message: "SES email requires EMAIL_ACCESS_KEY_ID and EMAIL_SECRET_ACCESS_KEY.",
          path: ["EMAIL_ACCESS_KEY_ID"],
        });
      }

      if (
        values.BLOB_PROVIDER === "s3" &&
        !(values.BLOB_BUCKET && values.BLOB_ACCESS_KEY_ID && values.BLOB_SECRET_ACCESS_KEY)
      ) {
        context.addIssue({
          code: "custom",
          message:
            "S3-compatible blob storage requires BLOB_BUCKET, BLOB_ACCESS_KEY_ID, and BLOB_SECRET_ACCESS_KEY.",
          path: ["BLOB_BUCKET"],
        });
      }

      if (values.BLOB_PROVIDER === "vercel" && !values.BLOB_READ_WRITE_TOKEN) {
        context.addIssue({
          code: "custom",
          message: "Vercel Blob storage requires BLOB_READ_WRITE_TOKEN.",
          path: ["BLOB_READ_WRITE_TOKEN"],
        });
      }

      if (
        values.KV_PROVIDER === "upstash" &&
        !(values.KV_REST_API_URL && values.KV_REST_API_TOKEN)
      ) {
        context.addIssue({
          code: "custom",
          message: "Upstash KV requires KV_REST_API_URL and KV_REST_API_TOKEN.",
          path: ["KV_REST_API_URL"],
        });
      }

      if (values.KV_PROVIDER === "redis" && !values.KV_REDIS_URL) {
        context.addIssue({
          code: "custom",
          message: "Redis KV requires KV_REDIS_URL.",
          path: ["KV_REDIS_URL"],
        });
      }
    }),
  emptyStringAsUndefined: true,
  extends: [vercel()],
  runtimeEnv: process.env,
  server: {
    // Auth
    AUTH_SECRET:
      process.env.NODE_ENV === "production" ? z.string().min(32) : z.string().min(32).optional(),

    // Database
    DATABASE_URL: z.string().min(1),

    // Deployment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.number().optional(),

    // Email
    EMAIL_ACCESS_KEY_ID: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(1),
    EMAIL_FROM_AUTH: z.string().min(1).optional(),
    EMAIL_FROM_INVITE: z.string().min(1).optional(),
    EMAIL_PROVIDER: z.enum(["ses", "smtp"]),
    EMAIL_REGION: z.string().min(1).optional(),
    EMAIL_REPLY_TO: z.string().min(1).optional(),
    EMAIL_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    EMAIL_SMTP_URL: z.string().min(1).optional(),
    // Billing
    POLAR_ACCESS_TOKEN: z.string().min(1),
    // KV
    KV_PROVIDER: z.enum(["upstash", "redis"]).optional(),
    KV_REDIS_URL: z.string().min(1).optional(),
    KV_REST_API_TOKEN: z.string().min(1).optional(),
    KV_REST_API_URL: z.url().optional(),
    // Object storage
    BLOB_ACCESS_KEY_ID: z.string().min(1).optional(),
    BLOB_BUCKET: z.string().min(1).optional(),
    BLOB_ENDPOINT: z.url().optional(),
    BLOB_FORCE_PATH_STYLE: z.stringbool().optional(),
    BLOB_PROVIDER: z.enum(["vercel", "s3"]),
    BLOB_PUBLIC_BASE_URL: z.url().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    BLOB_REGION: z.string().min(1).optional(),
    BLOB_SECRET_ACCESS_KEY: z.string().min(1).optional(),
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
