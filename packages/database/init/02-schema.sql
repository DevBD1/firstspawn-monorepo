CREATE TABLE "server_heartbeat_daily" (
	"server_id" uuid NOT NULL,
	"bucket_date" date NOT NULL,
	"sample_count" integer DEFAULT 0 NOT NULL,
	"payload_count" integer DEFAULT 0 NOT NULL,
	"ping_min_ms" smallint,
	"ping_max_ms" smallint,
	"ping_avg_ms" numeric(10, 2),
	"uptime_max_seconds" integer,
	"players_peak" integer,
	"max_players_peak" integer,
	"last_occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_heartbeat_daily" PRIMARY KEY("server_id","bucket_date"),
	CONSTRAINT "chk_server_heartbeat_daily_sample_count" CHECK ("server_heartbeat_daily"."sample_count" >= 0),
	CONSTRAINT "chk_server_heartbeat_daily_payload_count" CHECK ("server_heartbeat_daily"."payload_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "server_heartbeat_hourly" (
	"server_id" uuid NOT NULL,
	"bucket_start" timestamp with time zone NOT NULL,
	"sample_count" integer DEFAULT 0 NOT NULL,
	"payload_count" integer DEFAULT 0 NOT NULL,
	"ping_min_ms" smallint,
	"ping_max_ms" smallint,
	"ping_avg_ms" numeric(10, 2),
	"uptime_max_seconds" integer,
	"players_peak" integer,
	"max_players_peak" integer,
	"last_occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_heartbeat_hourly" PRIMARY KEY("server_id","bucket_start"),
	CONSTRAINT "chk_server_heartbeat_hourly_sample_count" CHECK ("server_heartbeat_hourly"."sample_count" >= 0),
	CONSTRAINT "chk_server_heartbeat_hourly_payload_count" CHECK ("server_heartbeat_hourly"."payload_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "server_heartbeats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"server_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uptime_seconds" integer,
	"ping_ms" smallint,
	"online_players" integer,
	"max_players" integer,
	"payload" jsonb,
	"protocol_version" integer,
	"minecraft_version" varchar(50),
	"idempotency_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_server_heartbeats_ping_ms" CHECK ("server_heartbeats"."ping_ms" is null or "server_heartbeats"."ping_ms" >= 0),
	CONSTRAINT "chk_server_heartbeats_players" CHECK ("server_heartbeats"."online_players" is null or "server_heartbeats"."online_players" >= 0),
	CONSTRAINT "chk_server_heartbeats_max_players" CHECK ("server_heartbeats"."max_players" is null or "server_heartbeats"."max_players" >= 0),
	CONSTRAINT "chk_server_heartbeats_player_bounds" CHECK ("server_heartbeats"."online_players" is null or "server_heartbeats"."max_players" is null or "server_heartbeats"."online_players" <= "server_heartbeats"."max_players"),
	CONSTRAINT "chk_server_heartbeats_uptime_seconds" CHECK ("server_heartbeats"."uptime_seconds" is null or "server_heartbeats"."uptime_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" "citext" NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer NOT NULL,
	"game" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"online_mode" boolean DEFAULT true NOT NULL,
	"region" varchar(50),
	"website_url" varchar(2048),
	"discord_url" varchar(2048),
	"last_ping_at" timestamp with time zone,
	"last_probe_attempt_at" timestamp with time zone,
	"last_probe_success_at" timestamp with time zone,
	"last_probe_failure_at" timestamp with time zone,
	"consecutive_probe_failures" integer DEFAULT 0 NOT NULL,
	"last_probe_error_code" varchar(80),
	"probe_status" varchar(20) DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_servers_port" CHECK ("servers"."port" between 1 and 65535),
	CONSTRAINT "chk_servers_game" CHECK ("servers"."game" in ('mc_java', 'mc_bedrock', 'hytale')),
	CONSTRAINT "chk_servers_status" CHECK ("servers"."status" in ('active', 'suspended', 'archived')),
	CONSTRAINT "chk_servers_probe_status" CHECK ("servers"."probe_status" in ('online', 'offline', 'unknown', 'unreachable')),
	CONSTRAINT "chk_servers_consecutive_probe_failures" CHECK ("servers"."consecutive_probe_failures" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_deletion_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"purge_after" timestamp with time zone NOT NULL,
	"cancelled_at" timestamp with time zone,
	"purged_at" timestamp with time zone,
	"expedite_requested_at" timestamp with time zone,
	"expedite_note" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_user_deletion_requests_purge_after" CHECK ("user_deletion_requests"."purge_after" > "user_deletion_requests"."requested_at")
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip" "inet",
	"user_agent" text,
	"device_fingerprint_hash" text,
	"device_type" varchar(50),
	"os_name" varchar(100),
	"client_name" varchar(100),
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" "citext" NOT NULL,
	"email_confirmed_at" timestamp with time zone,
	"username" "citext" NOT NULL,
	"password_hash" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"locale" varchar(10) DEFAULT 'en' NOT NULL,
	"terms_accepted" timestamp with time zone,
	"privacy_accepted" timestamp with time zone,
	"marketing_consent" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_users_status" CHECK ("users"."status" in ('active', 'suspended', 'deleted')),
	CONSTRAINT "chk_users_locale" CHECK ("users"."locale" in ('en', 'tr', 'de', 'ru', 'es', 'fr')),
	CONSTRAINT "chk_users_username_format" CHECK ("users"."username"::text ~ '^[A-Za-z0-9_]{3,32}$')
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" varchar(50) DEFAULT 'email_verification' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_verification_tokens_purpose" CHECK ("verification_tokens"."purpose" in ('email_verification', 'password_reset', 'account_restore'))
);
--> statement-breakpoint
ALTER TABLE "server_heartbeat_daily" ADD CONSTRAINT "server_heartbeat_daily_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_heartbeat_hourly" ADD CONSTRAINT "server_heartbeat_hourly_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_heartbeats" ADD CONSTRAINT "server_heartbeats_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deletion_requests" ADD CONSTRAINT "user_deletion_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_server_heartbeat_daily_bucket_date" ON "server_heartbeat_daily" USING btree ("bucket_date");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeat_hourly_bucket_start" ON "server_heartbeat_hourly" USING btree ("bucket_start");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_server_id" ON "server_heartbeats" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_occurred_at" ON "server_heartbeats" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_server_occurred" ON "server_heartbeats" USING btree ("server_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_server_heartbeats_server_idempotency" ON "server_heartbeats" USING btree ("server_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "servers_slug_unique" ON "servers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_servers_status" ON "servers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_servers_game" ON "servers" USING btree ("game");--> statement-breakpoint
CREATE INDEX "idx_servers_probe_status" ON "servers" USING btree ("probe_status");--> statement-breakpoint
CREATE INDEX "idx_user_deletion_requests_user_id" ON "user_deletion_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_deletion_requests_purge_after" ON "user_deletion_requests" USING btree ("purge_after");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_deletion_requests_active_user" ON "user_deletion_requests" USING btree ("user_id") WHERE "user_deletion_requests"."cancelled_at" is null and "user_deletion_requests"."purged_at" is null;--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expires_at" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_last_seen_at" ON "user_sessions" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_user_id" ON "verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_verification_tokens_token_hash" ON "verification_tokens" USING btree ("token_hash");
