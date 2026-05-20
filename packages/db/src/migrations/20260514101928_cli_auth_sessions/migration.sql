CREATE TYPE "cli_auth_session_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "cli_auth_session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"scope_id" text,
	"device_code_hash" text NOT NULL,
	"user_code_hash" text NOT NULL,
	"deploy_token_hash" text,
	"status" "cli_auth_session_status" DEFAULT 'pending'::"cli_auth_session_status" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"last_polled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cli_auth_session_project_id_status_idx" ON "cli_auth_session" ("project_id","status");--> statement-breakpoint
CREATE INDEX "cli_auth_session_expires_at_idx" ON "cli_auth_session" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_auth_session_device_code_hash_unique" ON "cli_auth_session" ("device_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_auth_session_user_code_hash_unique" ON "cli_auth_session" ("user_code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_auth_session_deploy_token_hash_unique" ON "cli_auth_session" ("deploy_token_hash");--> statement-breakpoint
ALTER TABLE "cli_auth_session" ADD CONSTRAINT "cli_auth_session_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;
