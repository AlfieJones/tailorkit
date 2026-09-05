-- This rollout assumes organization is empty. Require 14-character public IDs.
ALTER TABLE "organization" DROP CONSTRAINT "organization_public_id_format";--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_public_id_format" CHECK ("public_id" ~ '^[a-z0-9][a-z0-9-]{12}[a-z0-9]$');
