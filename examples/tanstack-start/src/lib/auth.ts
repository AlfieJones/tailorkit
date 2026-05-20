import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync(join(import.meta.dirname, "../../auth.sqlite"));

export const auth = betterAuth({
  appName: "TailorKit CRM",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [tanstackStartCookies()],
  secret:
    process.env.BETTER_AUTH_SECRET ?? "tailorkit-demo-auth-secret-change-me-before-production",
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
