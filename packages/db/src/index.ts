import { env } from "@tailorkit/env/server";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";

import { relations } from "./relations";

export function createDb(): NodePgDatabase<typeof relations> {
  return drizzle(env.DATABASE_URL, { relations });
}

export const db = createDb();

export { isOrgSlugReserved } from "./validate-org-slug";
