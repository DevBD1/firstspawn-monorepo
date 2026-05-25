CREATE TABLE IF NOT EXISTS "countries" (
	"iso_a_2" varchar(2) PRIMARY KEY NOT NULL,
	"iso_a_3" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "countries_name_unique" ON "countries" USING btree ("name");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "server_supported_clients" (
	"id" uuid PRIMARY KEY NOT NULL,
	"server_id" uuid NOT NULL,
	"client_name" varchar(20) NOT NULL,
	"client_version" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_server_supported_clients_client_name" CHECK ("server_supported_clients"."client_name" in ('mc_java', 'mc_bedrock', 'hytale'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_server_supported_clients_server_id" ON "server_supported_clients" USING btree ("server_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_server_supported_clients_unique" ON "server_supported_clients" USING btree ("server_id","client_name","client_version");
--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN IF NOT EXISTS "owner_id" uuid;
--> statement-breakpoint
ALTER TABLE "servers" ADD COLUMN IF NOT EXISTS "country_code" varchar(2);
--> statement-breakpoint
ALTER TABLE "servers" DROP COLUMN IF EXISTS "region";
--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_country_code_countries_iso_a_2_fk" FOREIGN KEY ("country_code") REFERENCES "countries"("iso_a_2") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "server_supported_clients" ADD CONSTRAINT "server_supported_clients_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_servers_owner_id" ON "servers" USING btree ("owner_id");