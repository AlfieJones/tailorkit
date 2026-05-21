import { createDb } from "@tailorkit/db";
import * as schema from "@tailorkit/db/schema/auth";
import { sendBetterAuthOtpEmail, sendOrganizationInvitationEmail } from "@tailorkit/email";
import { env, getBaseUrl } from "@tailorkit/env/server";
import { getKV } from "@tailorkit/kv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { waitUntil as vercelWaitUntil } from "@vercel/functions";
import { haveIBeenPwned } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { ac, roles } from "./lib/permissions";
import { apiKey } from "@better-auth/api-key";

const noopWaitUntil = (promise: Promise<unknown>) => void promise;

const createSecondaryStorage = () => {
  const kv = getKV();

  if (!kv) {
    return;
  }

  return {
    delete: (key: string) => kv.delete(key),
    get: (key: string) => kv.get(key),
    set: (key: string, value: string, ttl?: number) => kv.set(key, value, { ttl }),
  };
};

export function createAuth() {
  const db = createDb();

  const backgroundTaskHandler = env.VERCEL ? vercelWaitUntil : noopWaitUntil;
  const secondaryStorage = createSecondaryStorage();

  return betterAuth({
    account: {
      encryptOAuthTokens: true,
    },
    advanced: {
      backgroundTasks: {
        handler: backgroundTaskHandler,
      },
      cookiePrefix: env.VERCEL_TARGET_ENV === "production" ? "tailorkit" : "tailorkit-dev",
      database: {
        generateId: "uuid",
      },
    },
    baseURL: getBaseUrl(),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
      transaction: true,
    }),
    secondaryStorage,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 12,
      revokeSessionsOnPasswordReset: true,
    },
    emailVerification: {
      sendOnSignUp: false,
    },
    plugins: [
      haveIBeenPwned(),
      emailOTP({
        expiresIn: 600,
        overrideDefaultEmailVerification: true,
        sendVerificationOnSignUp: false,
        sendVerificationOTP: ({ email, otp, type }) => {
          backgroundTaskHandler(sendBetterAuthOtpEmail({ email, otp, type }));
          return Promise.resolve();
        },
      }),
      organization({
        ac,
        roles,
        sendInvitationEmail: async (data) => {
          await sendOrganizationInvitationEmail({
            email: data.email,
            invitationId: data.id,
            inviterName: data.inviter.user.name,
            organizationName: data.organization.name,
            role: data.role,
          });
        },
        schema: {
          organization: {
            additionalFields: {
              slug: {
                type: "string",
                fieldName: "slug",
                unique: true,
              },
            },
          },
        },
      }),
      apiKey({
        configId: "project-host",
        defaultPrefix: "tk_proj_",
        enableMetadata: true,
        keyExpiration: {
          defaultExpiresIn: null,
          maxExpiresIn: 3650,
          minExpiresIn: 0,
        },
        references: "organization",
        ...(secondaryStorage
          ? {
              fallbackToDatabase: true,
              storage: "secondary-storage" as const,
            }
          : {
              storage: "database" as const,
            }),
      }),
      tanstackStartCookies(),
    ],
    secret: env.AUTH_SECRET,
    trustedOrigins: [getBaseUrl()],
    user: {
      additionalFields: {
        theme: {
          defaultValue: "system",
          fieldName: "theme",
          required: false,
          type: "string",
        },
      },
    },
  });
}

export const auth = createAuth();

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
