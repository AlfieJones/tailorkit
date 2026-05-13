import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      AUTH_SECRET: "test-auth-secret-test-auth-secret",
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      NODE_ENV: "test",
      POLAR_ACCESS_TOKEN: "test-polar-token",
      SMTP_FROM: "test@example.com",
    },
    pool: "forks",
  },
});
