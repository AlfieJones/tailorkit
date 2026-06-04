ALTER TABLE "app" ADD COLUMN "public_id" varchar(10);--> statement-breakpoint
WITH numbered_apps AS (
  SELECT
    "id",
    lpad(row_number() OVER (PARTITION BY "project_id" ORDER BY "created_at", "id")::text, 10, '0') AS "public_id"
  FROM "app"
)
UPDATE "app"
SET "public_id" = numbered_apps."public_id"
FROM numbered_apps
WHERE "app"."id" = numbered_apps."id" AND "app"."public_id" IS NULL;--> statement-breakpoint
ALTER TABLE "app" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "app_project_id_public_id_unique" ON "app" ("project_id", "public_id");--> statement-breakpoint

ALTER TABLE "app_deployment" ADD COLUMN "public_id" varchar(10);--> statement-breakpoint
WITH numbered_deployments AS (
  SELECT
    "id",
    lpad(row_number() OVER (PARTITION BY "app_id" ORDER BY "created_at", "id")::text, 10, '0') AS "public_id"
  FROM "app_deployment"
)
UPDATE "app_deployment"
SET "public_id" = numbered_deployments."public_id"
FROM numbered_deployments
WHERE "app_deployment"."id" = numbered_deployments."id" AND "app_deployment"."public_id" IS NULL;--> statement-breakpoint
ALTER TABLE "app_deployment" ALTER COLUMN "public_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "app_deployment_app_id_public_id_unique" ON "app_deployment" ("app_id", "public_id");
