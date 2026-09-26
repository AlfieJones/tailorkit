import { env } from "#env";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./relations";

export function createDb(): NodePgDatabase<typeof relations> {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to create a database connection.");
  }

  return drizzle(env.DATABASE_URL, { relations });
}

export const db = createDb();

export { isOrgSlugReserved } from "./validate-org-slug";
