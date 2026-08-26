ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "account"
SET
  "issuer" = 'local:credential',
  "account_id" = "user_id"::text
WHERE "provider_id" = 'credential';--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "account" WHERE "issuer" IS NULL) THEN
    RAISE EXCEPTION 'Cannot complete Better Auth 1.7 account issuer migration: non-credential accounts require an explicit trusted issuer mapping';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" ("issuer", "account_id");
