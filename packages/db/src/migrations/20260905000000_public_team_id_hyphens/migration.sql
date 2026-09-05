ALTER TABLE "organization" DROP CONSTRAINT "organization_public_id_format";--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_public_id_format" CHECK ("public_id" ~ '^[a-z0-9][a-z0-9-]{8}[a-z0-9]$');
