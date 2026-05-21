import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { project } from "./project";
import { createSelectSchema } from "drizzle-orm/zod";
import z from "zod";

export const app = pgTable(
  "app",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),

    scopeId: text("scope_id").notNull(),

    name: text("name").notNull(),
    description: text("description"),

    currentDeploymentId: uuid("current_deployment_id").references(
      (): AnyPgColumn => appDeployment.id,
      { onDelete: "restrict" },
    ),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("app_projectId_scopeId_idx").on(table.projectId, table.scopeId)],
);

export const App = createSelectSchema(app, {
  name: z.string().max(127),
  description: z.string().max(255).nullable(),
  scopeId: z.string().max(255),
});
export type App = z.output<typeof App>;

export const appDeploymentStatus = pgEnum("app_deployment_status", [
  "uploading",
  "deploying",
  "verifying",
  "published",
]);

export const appDeployment = pgTable("app_deployment", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  appId: uuid("app_id")
    .notNull()
    .references(() => app.id, { onDelete: "cascade" }),

  status: appDeploymentStatus("status").default("deploying").notNull(),

  clientEntryFileId: uuid("client_entry_file_id").references(
    (): AnyPgColumn => appDeploymentFile.id,
    { onDelete: "restrict" },
  ),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const AppDeployment = createSelectSchema(appDeployment);
export type AppDeployment = z.output<typeof AppDeployment>;

export const appDeploymentFileContentType = pgEnum("app_deployment_file_content_type", [
  "application/javascript",
]);

export const appDeploymentFileEncoding = pgEnum("app_deployment_file_encoding", ["utf-8"]);

export const appDeploymentFileStatus = pgEnum("app_deployment_file_status", [
  "uploading",
  "verifying",
  "verified",
  "failed",
]);

export const appDeploymentFile = pgTable(
  "app_deployment_file",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    appDeploymentId: uuid("app_deployment_id")
      .notNull()
      .references(() => appDeployment.id, { onDelete: "cascade" }),

    objectKey: text("object_key").notNull(),
    contentType: appDeploymentFileContentType("content_type").notNull(),
    encoding: appDeploymentFileEncoding("encoding").notNull(),
    contentLength: integer("content_length").notNull(),
    checksum: varchar("checksum", { length: 64 }),
    status: appDeploymentFileStatus("status").default("uploading").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("app_deployment_file_app_deployment_id_object_key_unique").on(
      table.appDeploymentId,
      table.objectKey,
    ),
  ],
);

export const AppDeploymentFile = createSelectSchema(appDeploymentFile, {
  objectKey: z
    .string()
    .max(512)
    .regex(
      /^(?:[a-zA-Z0-9._-]+\/)*[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/u,
      "Must be a valid object key like assets/client.js",
    ),
});
export type AppDeploymentFile = z.output<typeof AppDeploymentFile>;
