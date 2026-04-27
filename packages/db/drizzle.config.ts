import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ["../../apps/web/.env.local", "../../apps/web/.env"],
});

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/schema/index.ts",
  verbose: true,
});
