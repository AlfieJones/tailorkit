import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      AUTH_SECRET: "test-auth-secret-test-auth-secret",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      EMAIL_FROM: "test@example.com",
      EMAIL_PROVIDER: "smtp",
      EMAIL_SMTP_URL: "smtp://localhost:1025",
      NODE_ENV: "test",
      POLAR_ACCESS_TOKEN: "test-polar-token",
    },
    pool: "forks",
  },
});
