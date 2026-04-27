// import { polar, checkout, portal } from "@polar-sh/better-auth";
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

const noopWaitUntil = (promise: Promise<unknown>) => void promise;

// import { polarClient } from "./lib/payments";

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
    plugins: [
      haveIBeenPwned(),
      emailOTP({
        expiresIn: 600,
        sendVerificationOTP: ({ email, otp, type }) => {
          backgroundTaskHandler(sendBetterAuthOtpEmail({ email, otp, type }));
          return Promise.resolve();
        },
      }),
      organization({
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
      // polar({
      //   client: polarClient,
      //   createCustomerOnSignUp: true,
      //   enableCustomerPortal: true,
      //   use: [
      //     checkout({
      //       authenticatedUsersOnly: true,
      //       products: [
      //         {
      //           productId: "your-product-id",
      //           slug: "pro",
      //         },
      //       ],
      //       successUrl: env.POLAR_SUCCESS_URL,
      //     }),
      //     portal(),
      //   ],
      // }),
      tanstackStartCookies(),
    ],
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [getBaseUrl()],
    user: {
      additionalFields: {
        bio: {
          defaultValue: null,
          fieldName: "bio",
          required: false,
          type: "string",
        },
      },
    },
  });
}

export const auth = createAuth();
