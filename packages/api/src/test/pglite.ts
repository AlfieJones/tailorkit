import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { relations } from "@tailorkit/db/relations";
import * as schema from "@tailorkit/db/schema/index";
import { drizzle } from "drizzle-orm/pglite";

const apiDir = import.meta.dirname;
const migrationsDir = resolve(apiDir, "../../../db/src/migrations");
const migrationFiles = [
  "20260427001215_lush_rictor/migration.sql",
  "20260429001501_sour_mercury/migration.sql",
  "20260429003330_luxuriant_mariko_yashida/migration.sql",
  "20260513014135_silky_nicolaos/migration.sql",
];

export async function createTestDb() {
  const client = new PGlite();

  for (const migrationFile of migrationFiles) {
    const sql = await readFile(resolve(migrationsDir, migrationFile), "utf-8");
    for (const statement of sql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      if (trimmed) {
        await client.exec(trimmed);
      }
    }
  }

  const db = drizzle({
    client,
    schema,
    relations,
  });

  return { client, db };
}
