CREATE TABLE "app" (
  "id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  "project_id" uuid NOT NULL,
  "resource_id" text NOT NULL,
  "key" text NOT NULL,
  "name" text,
  "description" text,
  "active_version_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "app_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "app_projectId_idx" ON "app" ("project_id");
--> statement-breakpoint
CREATE INDEX "app_resourceId_idx" ON "app" ("resource_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "app_projectId_key_unique" ON "app" ("project_id", "key");
--> statement-breakpoint
CREATE TABLE "app_version" (
  "id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "status" text DEFAULT 'deploying' NOT NULL,
  "failure_reason" text,
  "published_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "app_version_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "app_version_status_check" CHECK ("app_version"."status" in ('deploying', 'verifying', 'published', 'failed'))
);
--> statement-breakpoint
CREATE INDEX "app_version_appId_idx" ON "app_version" ("app_id");
--> statement-breakpoint
CREATE TABLE "pending_asset_upload" (
  "id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  "app_id" uuid NOT NULL,
  "project_id" uuid NOT NULL,
  "kind" text NOT NULL,
  "status" text DEFAULT 'uploading' NOT NULL,
  "object_key" text NOT NULL,
  "max_bytes" integer NOT NULL,
  "checksum_sha256" text,
  "failure_reason" text,
  "upload_expires_at" timestamp NOT NULL,
  "verified_at" timestamp,
  "consumed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "pending_asset_upload_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "pending_asset_upload_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "pending_asset_upload_kind_check" CHECK ("pending_asset_upload"."kind" in ('client_entry')),
  CONSTRAINT "pending_asset_upload_status_check" CHECK ("pending_asset_upload"."status" in ('uploading', 'verifying', 'verified', 'failed', 'consumed'))
);
--> statement-breakpoint
CREATE INDEX "pending_asset_upload_appId_idx" ON "pending_asset_upload" ("app_id");
--> statement-breakpoint
CREATE INDEX "pending_asset_upload_projectId_idx" ON "pending_asset_upload" ("project_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "pending_asset_upload_objectKey_unique" ON "pending_asset_upload" ("object_key");
--> statement-breakpoint
CREATE TABLE "app_version_client_file" (
  "id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  "version_id" uuid NOT NULL,
  "object_key" text NOT NULL,
  "content_type" text,
  "content_length" integer,
  "checksum_sha256" text,
  "etag" text,
  "verified_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "app_version_client_file_version_id_app_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."app_version"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX "app_version_client_file_versionId_idx" ON "app_version_client_file" ("version_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "app_version_client_file_objectKey_unique" ON "app_version_client_file" ("object_key");
--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_active_version_id_app_version_id_fk" FOREIGN KEY ("active_version_id") REFERENCES "public"."app_version"("id") ON DELETE set null ON UPDATE no action;
