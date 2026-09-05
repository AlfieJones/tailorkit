ALTER TABLE organization ADD COLUMN IF NOT EXISTS public_id text;--> statement-breakpoint
-- Match the application alphabet: DNS labels are case-insensitive, `_` is
-- invalid, and `-` cannot occur at either edge. Lowercase alphanumeric is the
-- largest alphabet safe at every random position.
CREATE OR REPLACE FUNCTION tailorkit_team_nanoid() RETURNS text LANGUAGE plpgsql VOLATILE AS $$
DECLARE alphabet constant text := '0123456789abcdefghijklmnopqrstuvwxyz'; result text := ''; candidate integer;
BEGIN
  WHILE length(result) < 10 LOOP
    candidate := get_byte(decode(replace(gen_random_uuid()::text, '-', ''), 'hex'), 0) & 63;
    IF candidate < 36 THEN result := result || substr(alphabet, candidate + 1, 1); END IF;
  END LOOP;
  RETURN result;
END;
$$;--> statement-breakpoint
CREATE OR REPLACE FUNCTION tailorkit_assign_team_public_id() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE attempts integer := 0;
BEGIN
  IF NEW.public_id IS NULL THEN NEW.public_id := tailorkit_team_nanoid(); END IF;
  LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(NEW.public_id, 0));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM organization WHERE public_id = NEW.public_id);
    attempts := attempts + 1;
    IF attempts > 100 THEN RAISE EXCEPTION 'Unable to allocate public team ID'; END IF;
    NEW.public_id := tailorkit_team_nanoid();
  END LOOP;
  RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS organization_assign_public_id ON organization;--> statement-breakpoint
CREATE TRIGGER organization_assign_public_id BEFORE INSERT ON organization FOR EACH ROW EXECUTE FUNCTION tailorkit_assign_team_public_id();--> statement-breakpoint
DO $$ DECLARE team record; candidate text; BEGIN
  FOR team IN SELECT id FROM organization WHERE public_id IS NULL ORDER BY id LOOP
    LOOP
      candidate := tailorkit_team_nanoid();
      PERFORM pg_advisory_xact_lock(hashtextextended(candidate, 0));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM organization WHERE public_id = candidate);
    END LOOP;
    UPDATE organization SET public_id = candidate WHERE id = team.id;
  END LOOP;
END $$;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_public_id_format') THEN
    ALTER TABLE organization ADD CONSTRAINT organization_public_id_format CHECK (public_id ~ '^[a-z0-9]{10}$') NOT VALID;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE organization VALIDATE CONSTRAINT organization_public_id_format;--> statement-breakpoint
ALTER TABLE organization ALTER COLUMN public_id SET NOT NULL;--> statement-breakpoint
CREATE OR REPLACE FUNCTION tailorkit_keep_team_public_id() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.public_id IS DISTINCT FROM OLD.public_id THEN
    RAISE EXCEPTION 'Public team IDs are permanent' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;--> statement-breakpoint
DROP TRIGGER IF EXISTS organization_keep_public_id ON organization;--> statement-breakpoint
CREATE TRIGGER organization_keep_public_id BEFORE UPDATE OF public_id ON organization FOR EACH ROW EXECUTE FUNCTION tailorkit_keep_team_public_id();--> statement-breakpoint
DROP INDEX CONCURRENTLY IF EXISTS organization_public_id_key_idx;--> statement-breakpoint
CREATE UNIQUE INDEX CONCURRENTLY organization_public_id_key_idx ON organization (public_id);
