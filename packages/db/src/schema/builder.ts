import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { app } from "./apps";
import { project } from "./project";

export const builderRunStatus = pgEnum("builder_run_status", [
  "queued",
  "running",
  "preview_ready",
  "failed",
  "published",
]);

/** An origin is scoped to the authenticated host's app, never to a client supplied scope. */
export const appOrigin = pgTable(
  "app_origin",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    scopeId: text("scope_id").notNull(),
    origin: text("origin").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("app_origin_app_id_unique").on(table.appId),
    index("app_origin_project_scope_idx").on(table.projectId, table.scopeId),
  ],
);

export const builderConversation = pgTable(
  "builder_conversation",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    scopeId: text("scope_id").notNull(),
    title: text("title"),
    messages: jsonb("messages")
      .$type<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("builder_conversation_project_scope_idx").on(table.projectId, table.scopeId)],
);

export const builderRun = pgTable(
  "builder_run",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => builderConversation.id, { onDelete: "cascade" }),
    scopeId: text("scope_id").notNull(),
    status: builderRunStatus("status").notNull().default("queued"),
    candidateDeploymentId: uuid("candidate_deployment_id"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("builder_run_app_scope_idx").on(table.appId, table.scopeId),
    index("builder_run_conversation_idx").on(table.conversationId),
  ],
);

export const appSourceRevision = pgTable(
  "app_source_revision",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    appId: uuid("app_id")
      .notNull()
      .references(() => app.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => builderConversation.id, { onDelete: "cascade" }),
    runId: uuid("run_id")
      .notNull()
      .references(() => builderRun.id, { onDelete: "cascade" }),
    scopeId: text("scope_id").notNull(),
    revision: text("revision").notNull(),
    objectKey: text("object_key").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("app_source_revision_app_revision_unique").on(table.appId, table.revision),
    index("app_source_revision_scope_idx").on(table.projectId, table.scopeId),
  ],
);
