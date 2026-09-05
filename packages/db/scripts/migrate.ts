import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: ["../../apps/web/.env.local", "../../apps/web/.env"], quiet: true });
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const migrationDirectory = new URL(
  "../src/migrations/20260904000000_public_team_asset_ids/",
  import.meta.url,
);

const readStatements = async (filename: string) => {
  const sql = await readFile(new URL(filename, migrationDirectory), "utf-8");
  return sql
    .split("--> statement-breakpoint")
    .map((value) => value.trim())
    .filter(Boolean);
};

const runDrizzleMigrations = async () => {
  const child = spawn(
    process.execPath,
    ["--preserve-symlinks-main", "./node_modules/drizzle-kit/bin.cjs", "migrate"],
    { cwd: new URL("..", import.meta.url), stdio: "inherit" },
  );
  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
  if (exitCode !== 0) {
    throw new Error(`drizzle-kit migrate exited with code ${exitCode}`);
  }
};

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("SELECT pg_advisory_lock(hashtext('tailorkit:db:migrate'))");

  const organization = await client.query<{ exists: boolean }>(
    "SELECT to_regclass('organization') IS NOT NULL AS exists",
  );
  if (!organization.rows[0]?.exists) {
    // Bootstrap the base schema first. This migration's contract safely no-ops
    // until its concurrently-created index exists.
    await runDrizzleMigrations();
  }

  const constraint = await client.query<{ ready: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_public_id_key') AS ready",
  );
  if (!constraint.rows[0]?.ready) {
    for (const statement of await readStatements("prepare.sql")) {
      // Each statement autocommits because PostgreSQL forbids concurrent index
      // creation inside a transaction block.
      await client.query(statement);
    }
  }

  await runDrizzleMigrations();

  const attached = await client.query<{ ready: boolean }>(
    "SELECT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_public_id_key') AS ready",
  );
  if (!attached.rows[0]?.ready) {
    // A fresh bootstrap already recorded the no-op contract migration, so attach
    // the prepared index explicitly in one short transaction.
    await client.query("BEGIN");
    try {
      for (const statement of await readStatements("migration.sql")) {
        await client.query(statement);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
