import { env } from "@tailorkit/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
import { relations } from "./relations";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema, relations, logger: env.NODE_ENV === "development" });
}

export const db = createDb();

export { isOrgSlugReserved } from "./validate-org-slug";
