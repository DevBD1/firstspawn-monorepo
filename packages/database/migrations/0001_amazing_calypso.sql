CREATE TABLE "server_vote_counters" (
	"server_id" uuid NOT NULL,
	"month" date NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"first_vote_at" timestamp with time zone,
	"last_vote_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_vote_counters" PRIMARY KEY("server_id","month"),
	CONSTRAINT "chk_server_vote_counters_count" CHECK ("server_vote_counters"."count" >= 0),
	CONSTRAINT "chk_server_vote_counters_month_start" CHECK ("server_vote_counters"."month" = date_trunc('month', "server_vote_counters"."month"::timestamp)::date)
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"username_normalized" "citext" NOT NULL,
	"voted_on" date NOT NULL,
	"ip_hmac" text,
	"asn" varchar(32),
	"country_code" varchar(2),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_votes_username_normalized" CHECK ("votes"."username_normalized"::text ~ '^[a-z0-9_]{3,16}$')
);
--> statement-breakpoint
ALTER TABLE "server_vote_counters" ADD CONSTRAINT "server_vote_counters_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_server_vote_counters_month_count" ON "server_vote_counters" USING btree ("month","count");--> statement-breakpoint
CREATE INDEX "idx_votes_server_id" ON "votes" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_votes_voted_on" ON "votes" USING btree ("voted_on");--> statement-breakpoint
CREATE INDEX "idx_votes_created_at" ON "votes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_server_day_ip_unique" ON "votes" USING btree ("server_id","voted_on","ip_hmac");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_server_day_username_unique" ON "votes" USING btree ("server_id","voted_on","username_normalized");
