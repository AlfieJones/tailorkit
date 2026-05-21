import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";
import z from "zod";
import { project } from "./project";

export const cliAuthSessionStatus = pgEnum("cli_auth_session_status", [
  "pending",
  "approved",
  "denied",
]);

export const cliToken = pgTable(
  "cli_token",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),

    scopeId: text("scope_id").notNull(),

    tokenHash: text("token_hash").notNull(),

    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    lastUsedAt: timestamp("last_used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("cli_token_project_id_scope_id_idx").on(table.projectId, table.scopeId),
    index("cli_token_expires_at_idx").on(table.expiresAt),
    index("cli_token_revoked_at_idx").on(table.revokedAt),
    uniqueIndex("cli_token_token_hash_unique").on(table.tokenHash),
  ],
);

export const cliAuthSession = pgTable(
  "cli_auth_session",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),

    scopeId: text("scope_id"),

    deviceCodeHash: text("device_code_hash").notNull(),
    userCodeHash: text("user_code_hash").notNull(),

    status: cliAuthSessionStatus("status").default("pending").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    lastPolledAt: timestamp("last_polled_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("cli_auth_session_project_id_status_idx").on(table.projectId, table.status),
    index("cli_auth_session_expires_at_idx").on(table.expiresAt),

    uniqueIndex("cli_auth_session_device_code_hash_unique").on(table.deviceCodeHash),
    uniqueIndex("cli_auth_session_user_code_hash_unique").on(table.userCodeHash),
  ],
);

export const CliToken = createSelectSchema(cliToken, {
  scopeId: z.string().max(255),
});

export type CliToken = z.output<typeof CliToken>;

export const CliAuthSession = createSelectSchema(cliAuthSession, {
  scopeId: z.string().max(255).nullable(),
});

export type CliAuthSession = z.output<typeof CliAuthSession>;
