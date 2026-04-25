ALTER TABLE "servers" ADD COLUMN "last_probe_attempt_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "last_probe_success_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "last_probe_failure_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "consecutive_probe_failures" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "last_probe_error_code" varchar(80);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "probe_status" varchar(20) DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
UPDATE "servers"
SET
  "last_probe_attempt_at" = "last_ping_at",
  "last_probe_success_at" = "last_ping_at",
  "probe_status" = CASE WHEN "last_ping_at" IS NULL THEN 'unknown' ELSE 'online' END
WHERE "last_ping_at" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "chk_servers_probe_status" CHECK ("servers"."probe_status" in ('online', 'offline', 'unknown', 'unreachable'));--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "chk_servers_consecutive_probe_failures" CHECK ("servers"."consecutive_probe_failures" >= 0);--> statement-breakpoint
CREATE INDEX "idx_servers_probe_status" ON "servers" USING btree ("probe_status");--> statement-breakpoint
