-- This rollout assumes organization is empty. Better Auth supplies public_id
-- from its JavaScript NanoID hook; the database intentionally has no default.
ALTER TABLE "organization" ADD COLUMN "public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_public_id_key" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_public_id_format" CHECK ("public_id" ~ '^[a-z0-9]{10}$');--> statement-breakpoint
CREATE FUNCTION tailorkit_keep_team_public_id() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id THEN
    RAISE EXCEPTION 'Public team IDs are permanent' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER organization_keep_public_id BEFORE UPDATE OF public_id ON organization
FOR EACH ROW EXECUTE FUNCTION tailorkit_keep_team_public_id();
