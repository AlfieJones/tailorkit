import { polar, checkout, portal, usage } from "@polar-sh/better-auth";
import { createDb } from "@tailorkit/db";
import * as schema from "@tailorkit/db/schema/auth";
import { sendBetterAuthOtpEmail } from "@tailorkit/email";
import { env, getBaseUrl } from "@tailorkit/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { waitUntil as vercelWaitUntil } from "@vercel/functions";
import { haveIBeenPwned } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { polarClient } from "./lib/payments";
import { ac, roles } from "./lib/permissions";

const noopWaitUntil = (promise: Promise<unknown>) => void promise;

export function createAuth() {
  const db = createDb();

  const backgroundTaskHandler = env.VERCEL ? vercelWaitUntil : noopWaitUntil;

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
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
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
      polar({
        client: polarClient,
        createCustomerOnSignUp: false,
        enableCustomerPortal: true,
        use: [
          checkout({
            authenticatedUsersOnly: true,
            products: [
              {
                productId: "your-product-id",
                slug: "pro",
              },
              {
                productId: "your-product-id",
                slug: "enterprise",
              },
            ],
            successUrl: "/todo-success?checkout_id={CHECKOUT_ID}",
          }),
          portal(),
          usage({ creditProducts: [{ slug: "builder-credits", productId: "some-product-id" }] }),
        ],
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
