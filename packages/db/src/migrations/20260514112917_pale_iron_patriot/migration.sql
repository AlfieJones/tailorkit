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
DROP INDEX "cli_auth_session_deploy_token_hash_unique";--> statement-breakpoint
ALTER TABLE "cli_auth_session" DROP COLUMN "deploy_token_hash";--> statement-breakpoint
CREATE INDEX "cli_token_project_id_idx" ON "cli_token" ("project_id");--> statement-breakpoint
CREATE INDEX "cli_token_project_id_scope_id_idx" ON "cli_token" ("project_id","scope_id");--> statement-breakpoint
CREATE INDEX "cli_token_expires_at_idx" ON "cli_token" ("expires_at");--> statement-breakpoint
CREATE INDEX "cli_token_revoked_at_idx" ON "cli_token" ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cli_token_token_hash_unique" ON "cli_token" ("token_hash");--> statement-breakpoint
ALTER TABLE "cli_token" ADD CONSTRAINT "cli_token_project_id_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;
