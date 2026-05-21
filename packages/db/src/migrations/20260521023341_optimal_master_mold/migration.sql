CREATE TYPE "app_deployment_file_content_type" AS ENUM('application/javascript');--> statement-breakpoint
CREATE TYPE "app_deployment_file_encoding" AS ENUM('utf-8');--> statement-breakpoint
CREATE TYPE "app_deployment_file_status" AS ENUM('uploading', 'verifying', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "app_deployment_status" AS ENUM('uploading', 'deploying', 'verifying', 'published');--> statement-breakpoint
CREATE TYPE "cli_auth_session_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "todo" (
	"completed" boolean DEFAULT false NOT NULL,
	"id" serial PRIMARY KEY,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"config_id" text DEFAULT 'default' NOT NULL,
	"name" text,
	"start" text,
	"reference_id" text NOT NULL,
	"prefix" text,
	"key" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text UNIQUE,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"active_organization_id" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"theme" text DEFAULT 'system'
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"current_deployment_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_deployment" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"app_id" uuid NOT NULL,
	"status" "app_deployment_status" DEFAULT 'deploying'::"app_deployment_status" NOT NULL,
	"client_entry_file_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_deployment_file" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"app_deployment_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"content_type" "app_deployment_file_content_type" NOT NULL,
	"encoding" "app_deployment_file_encoding" NOT NULL,
	"content_length" integer NOT NULL,
	"checksum" varchar(64),
	"status" "app_deployment_file_status" DEFAULT 'uploading'::"app_deployment_file_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cli_auth_session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"scope_id" text,
	"device_code_hash" text NOT NULL,
	"user_code_hash" text NOT NULL,
	"status" "cli_auth_session_status" DEFAULT 'pending'::"cli_auth_session_status" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_polled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cli_token" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"scope_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "apikey_configId_idx" ON "apikey" ("config_id");--> statement-breakpoint
CREATE INDEX "apikey_referenceId_idx" ON "apikey" ("reference_id");--> statement-breakpoint
CREATE INDEX "apikey_key_idx" ON "apikey" ("key");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "project_organizationId_idx" ON "project" ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_organizationId_slug_unique" ON "project" ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "app_projectId_scopeId_idx" ON "app" ("project_id","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_deployment_file_app_deployment_id_object_key_unique" ON "app_deployment_file" ("app_deployment_id","object_key");--> statement-breakpoint
CREATE INDEX "cli_auth_session_project_id_status_idx" ON "cli_auth_session" ("project_id","status");--> statement-breakpoint
CREATE INDEX "cli_auth_session_expires_at_idx" ON "cli_auth_session" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_auth_session_device_code_hash_unique" ON "cli_auth_session" ("device_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_auth_session_user_code_hash_unique" ON "cli_auth_session" ("user_code_hash");--> statement-breakpoint
CREATE INDEX "cli_token_project_id_idx" ON "cli_token" ("project_id");--> statement-breakpoint
CREATE INDEX "cli_token_project_id_scope_id_idx" ON "cli_token" ("project_id","scope_id");--> statement-breakpoint
CREATE INDEX "cli_token_expires_at_idx" ON "cli_token" ("expires_at");--> statement-breakpoint
CREATE INDEX "cli_token_revoked_at_idx" ON "cli_token" ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_token_token_hash_unique" ON "cli_token" ("token_hash");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_current_deployment_id_app_deployment_id_fkey" FOREIGN KEY ("current_deployment_id") REFERENCES "app_deployment"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD CONSTRAINT "app_deployment_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD CONSTRAINT "app_deployment_client_entry_file_id_app_deployment_file_id_fkey" FOREIGN KEY ("client_entry_file_id") REFERENCES "app_deployment_file"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "app_deployment_file" ADD CONSTRAINT "app_deployment_file_app_deployment_id_app_deployment_id_fkey" FOREIGN KEY ("app_deployment_id") REFERENCES "app_deployment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cli_auth_session" ADD CONSTRAINT "cli_auth_session_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cli_token" ADD CONSTRAINT "cli_token_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;