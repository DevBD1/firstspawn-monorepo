CREATE TABLE "server_tags" (
	"server_id" uuid NOT NULL,
	"tag" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_tags" PRIMARY KEY("server_id","tag")
);
--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_server_tags_server_id" ON "server_tags" USING btree ("server_id");