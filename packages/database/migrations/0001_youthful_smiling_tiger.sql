CREATE TABLE "server_media" (
	"server_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_server_media_kind" CHECK ("server_media"."kind" in ('build', 'banner', 'screenshot', 'logo'))
);
--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "long_description" text;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "votifier_host" varchar(255);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "votifier_port" integer;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "votifier_public_key" text;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "votifier_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "verification_method" varchar(10);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "verification_token" varchar(80);--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "server_media" ADD CONSTRAINT "server_media_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_server_media_server_id" ON "server_media" USING btree ("server_id");--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "chk_servers_votifier_port" CHECK ("servers"."votifier_port" is null or "servers"."votifier_port" between 1 and 65535);--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "chk_servers_verification_method" CHECK ("servers"."verification_method" is null or "servers"."verification_method" in ('motd', 'dns'));