CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"actor_id" uuid,
	"actor_email" varchar(255) NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"entity_id" uuid,
	"action" varchar(40) NOT NULL,
	"reason" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_admin_audit_logs_entity_type" CHECK ("admin_audit_logs"."entity_type" in ('server')),
	CONSTRAINT "chk_admin_audit_logs_action" CHECK ("admin_audit_logs"."action" in ('create', 'update', 'status_change'))
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admin_audit_logs_entity" ON "admin_audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_logs_actor_id" ON "admin_audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_admin_audit_logs_created_at" ON "admin_audit_logs" USING btree ("created_at");