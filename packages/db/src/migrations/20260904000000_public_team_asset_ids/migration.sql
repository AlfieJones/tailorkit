-- The non-transactional preparation for this contract lives in prepare.sql and
-- is run by packages/db/scripts/migrate.ts. Keep this migration transactional:
-- it only attaches the concurrently-built index as the named constraint.
DO $$
BEGIN
  IF to_regclass('organization_public_id_key_idx') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'organization_public_id_key'
    )
  THEN
    ALTER TABLE organization
      ADD CONSTRAINT organization_public_id_key
      UNIQUE USING INDEX organization_public_id_key_idx;
  END IF;
END
$$;
