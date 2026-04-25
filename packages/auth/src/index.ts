// import { polar, checkout, portal } from "@polar-sh/better-auth";
import { createDb } from "@tailorkit/db";
import * as schema from "@tailorkit/db/schema/auth";
import { env } from "@tailorkit/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { waitUntil as vercelWaitUntil } from "@vercel/functions";
import { haveIBeenPwned } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { sendOtpEmail } from "./lib/email";

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
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    plugins: [
      haveIBeenPwned(),
      emailOTP({
        expiresIn: 600,
        sendVerificationOTP: async ({ email, otp, type }) => {
          backgroundTaskHandler(sendOtpEmail({ email, otp, type }));
        },
      }),
      organization(),
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
    trustedOrigins: [env.CORS_ORIGIN],
  });
}

export const auth = createAuth();
