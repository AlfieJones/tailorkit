CREATE TYPE "builder_run_status" AS ENUM('queued', 'running', 'preview_ready', 'failed', 'published');--> statement-breakpoint
CREATE TABLE "app_origin" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"origin" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_source_revision" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"run_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"revision" text NOT NULL,
	"object_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_conversation" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"title" text,
	"messages" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_run" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"app_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"status" "builder_run_status" DEFAULT 'queued'::"builder_run_status" NOT NULL,
	"candidate_deployment_id" uuid,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "app_origin_app_id_unique" ON "app_origin" ("app_id");--> statement-breakpoint
CREATE INDEX "app_origin_project_scope_idx" ON "app_origin" ("project_id","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_source_revision_app_revision_unique" ON "app_source_revision" ("app_id","revision");--> statement-breakpoint
CREATE INDEX "app_source_revision_scope_idx" ON "app_source_revision" ("project_id","scope_id");--> statement-breakpoint
CREATE INDEX "builder_conversation_project_scope_idx" ON "builder_conversation" ("project_id","scope_id");--> statement-breakpoint
CREATE INDEX "builder_run_app_scope_idx" ON "builder_run" ("app_id","scope_id");--> statement-breakpoint
CREATE INDEX "builder_run_conversation_idx" ON "builder_run" ("conversation_id");--> statement-breakpoint
ALTER TABLE "app_origin" ADD CONSTRAINT "app_origin_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_origin" ADD CONSTRAINT "app_origin_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_source_revision" ADD CONSTRAINT "app_source_revision_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_source_revision" ADD CONSTRAINT "app_source_revision_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_source_revision" ADD CONSTRAINT "app_source_revision_yncY2Tg6Zk3h_fkey" FOREIGN KEY ("conversation_id") REFERENCES "builder_conversation"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_source_revision" ADD CONSTRAINT "app_source_revision_run_id_builder_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "builder_run"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "builder_conversation" ADD CONSTRAINT "builder_conversation_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "builder_conversation" ADD CONSTRAINT "builder_conversation_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "builder_run" ADD CONSTRAINT "builder_run_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "builder_run" ADD CONSTRAINT "builder_run_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "builder_run" ADD CONSTRAINT "builder_run_conversation_id_builder_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "builder_conversation"("id") ON DELETE CASCADE;