ALTER TYPE "app_deployment_file_content_type" ADD VALUE 'image/svg+xml';--> statement-breakpoint
ALTER TYPE "app_deployment_file_content_type" ADD VALUE 'image/png';--> statement-breakpoint
ALTER TYPE "app_deployment_file_content_type" ADD VALUE 'image/webp';--> statement-breakpoint
ALTER TABLE "app_deployment" ADD COLUMN "logo_light_file_id" uuid;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD COLUMN "logo_dark_file_id" uuid;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD COLUMN "logo_light_path" text;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD COLUMN "logo_dark_path" text;--> statement-breakpoint
ALTER TABLE "app_deployment_file" ALTER COLUMN "encoding" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD CONSTRAINT "app_deployment_logo_light_file_id_app_deployment_file_id_fkey" FOREIGN KEY ("logo_light_file_id") REFERENCES "app_deployment_file"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "app_deployment" ADD CONSTRAINT "app_deployment_logo_dark_file_id_app_deployment_file_id_fkey" FOREIGN KEY ("logo_dark_file_id") REFERENCES "app_deployment_file"("id") ON DELETE RESTRICT;
