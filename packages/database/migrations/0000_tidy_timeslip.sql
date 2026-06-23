CREATE TABLE "countries" (
	"iso_a_2" varchar(2) PRIMARY KEY NOT NULL,
	"iso_a_3" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"latitude" double precision,
	"longitude" double precision
);
--> statement-breakpoint
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "server_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"url" varchar(2048) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_server_media_kind" CHECK ("server_media"."kind" in ('build', 'banner', 'screenshot', 'logo'))
);
--> statement-breakpoint
CREATE TABLE "server_moderation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid,
	"admin_id" uuid,
	"action" varchar(20) NOT NULL,
	"reason" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_server_moderation_logs_action" CHECK ("server_moderation_logs"."action" in ('suspended', 'unsuspended', 'warned'))
);
--> statement-breakpoint
CREATE TABLE "server_socials" (
	"server_id" uuid NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_socials" PRIMARY KEY("server_id","platform"),
	CONSTRAINT "chk_server_socials_platform" CHECK ("server_socials"."platform" in ('website', 'discord', 'youtube', 'twitter', 'instagram', 'tiktok', 'facebook'))
);
--> statement-breakpoint
CREATE TABLE "server_supported_clients" (
	"server_id" uuid NOT NULL,
	"client_name" varchar(20) NOT NULL,
	"client_version" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_supported_clients" PRIMARY KEY("server_id","client_name","client_version"),
	CONSTRAINT "chk_server_supported_clients_client_name" CHECK ("server_supported_clients"."client_name" in ('mc_java', 'mc_bedrock'))
);
--> statement-breakpoint
CREATE TABLE "server_tags" (
	"server_id" uuid NOT NULL,
	"tag" varchar(40) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk_server_tags" PRIMARY KEY("server_id","tag")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext" NOT NULL,
	"owner_id" uuid,
	"name" varchar(64) NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"host" varchar(255) NOT NULL,
	"port" integer NOT NULL,
	"votifier_host" varchar(255),
	"votifier_port" integer,
	"votifier_public_key" text,
	"votifier_enabled" boolean DEFAULT false NOT NULL,
	"verification_method" varchar(10),
	"verification_token" varchar(80),
	"verified_at" timestamp with time zone,
	"game" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"auth_mode" varchar(20) DEFAULT 'unknown' NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"reach_scope" varchar(20) DEFAULT 'local' NOT NULL,
	"logo_url" varchar(2048),
	"banner_url" varchar(2048),
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
	CONSTRAINT "chk_servers_game" CHECK ("servers"."game" in ('mc_java')),
	CONSTRAINT "chk_servers_status" CHECK ("servers"."status" in ('active', 'suspended', 'archived')),
	CONSTRAINT "chk_servers_auth_mode" CHECK ("servers"."auth_mode" in ('official', 'offline_allowed', 'unknown')),
	CONSTRAINT "chk_servers_probe_status" CHECK ("servers"."probe_status" in ('online', 'offline', 'unknown', 'unreachable')),
	CONSTRAINT "chk_servers_reach_scope" CHECK ("servers"."reach_scope" in ('local', 'regional', 'global')),
	CONSTRAINT "chk_servers_country_code_not_global" CHECK ("servers"."country_code" <> 'WW'),
	CONSTRAINT "chk_servers_consecutive_probe_failures" CHECK ("servers"."consecutive_probe_failures" >= 0),
	CONSTRAINT "chk_servers_votifier_port" CHECK ("servers"."votifier_port" is null or "servers"."votifier_port" between 1 and 65535),
	CONSTRAINT "chk_servers_verification_method" CHECK ("servers"."verification_method" is null or "servers"."verification_method" in ('motd', 'dns'))
);
--> statement-breakpoint
CREATE TABLE "user_consent_audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"ip" "inet",
	"user_agent" text,
	"action" varchar(20) NOT NULL,
	"consent_type" varchar(50) NOT NULL,
	"policy_version" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_user_consent_audit_logs_action" CHECK ("user_consent_audit_logs"."action" in ('opt_in', 'opt_out')),
	CONSTRAINT "chk_user_consent_audit_logs_type" CHECK ("user_consent_audit_logs"."consent_type" in ('marketing', 'privacy', 'terms'))
);
--> statement-breakpoint
CREATE TABLE "user_deletion_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
CREATE TABLE "user_moderation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"admin_id" uuid,
	"action" varchar(20) NOT NULL,
	"reason" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_user_moderation_logs_action" CHECK ("user_moderation_logs"."action" in ('suspended', 'unsuspended', 'warned'))
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
	"username" "citext" NOT NULL,
	"avatar_url" varchar(2048),
	"password_hash" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"locale" varchar(10),
	"country_code" varchar(2),
	"email_confirmed_at" timestamp with time zone,
	"marketing_consent_at" timestamp with time zone,
	"privacy_accepted_at" timestamp with time zone,
	"terms_accepted_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_users_username_format" CHECK ("users"."username"::text ~ '^[A-Za-z0-9_]{3,32}$'),
	CONSTRAINT "chk_users_status" CHECK ("users"."status" in ('active', 'suspended', 'deleted')),
	CONSTRAINT "chk_users_role" CHECK ("users"."role" in ('user', 'moderator', 'admin'))
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" varchar(50) DEFAULT 'email_verification' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_verification_tokens_purpose" CHECK ("verification_tokens"."purpose" in ('email_verification', 'password_reset', 'account_restore'))
);
--> statement-breakpoint
ALTER TABLE "server_heartbeat_daily" ADD CONSTRAINT "server_heartbeat_daily_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_heartbeat_hourly" ADD CONSTRAINT "server_heartbeat_hourly_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_heartbeats" ADD CONSTRAINT "server_heartbeats_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_media" ADD CONSTRAINT "server_media_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_moderation_logs" ADD CONSTRAINT "server_moderation_logs_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_moderation_logs" ADD CONSTRAINT "server_moderation_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_socials" ADD CONSTRAINT "server_socials_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_supported_clients" ADD CONSTRAINT "server_supported_clients_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_country_code_countries_iso_a_2_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("iso_a_2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_consent_audit_logs" ADD CONSTRAINT "user_consent_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deletion_requests" ADD CONSTRAINT "user_deletion_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_moderation_logs" ADD CONSTRAINT "user_moderation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_moderation_logs" ADD CONSTRAINT "user_moderation_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_country_code_countries_iso_a_2_fk" FOREIGN KEY ("country_code") REFERENCES "public"."countries"("iso_a_2") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "countries_name_unique" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeat_daily_bucket_date" ON "server_heartbeat_daily" USING btree ("bucket_date");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeat_hourly_bucket_start" ON "server_heartbeat_hourly" USING btree ("bucket_start");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_server_id" ON "server_heartbeats" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_occurred_at" ON "server_heartbeats" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_server_occurred" ON "server_heartbeats" USING btree ("server_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_server_heartbeats_server_latest" ON "server_heartbeats" USING btree ("server_id","occurred_at" DESC NULLS LAST,"created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_server_heartbeats_server_idempotency" ON "server_heartbeats" USING btree ("server_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_server_media_server_id" ON "server_media" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_moderation_logs_server_id" ON "server_moderation_logs" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_moderation_logs_admin_id" ON "server_moderation_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_server_socials_server_id" ON "server_socials" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_supported_clients_server_id" ON "server_supported_clients" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "idx_server_tags_server_id" ON "server_tags" USING btree ("server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "servers_slug_unique" ON "servers" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "servers_name_unique" ON "servers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_servers_owner_id" ON "servers" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_servers_status" ON "servers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_servers_game" ON "servers" USING btree ("game");--> statement-breakpoint
CREATE INDEX "idx_servers_probe_status" ON "servers" USING btree ("probe_status");--> statement-breakpoint
CREATE INDEX "idx_user_consent_audit_logs_user_id" ON "user_consent_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_deletion_requests_user_id" ON "user_deletion_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_deletion_requests_purge_after" ON "user_deletion_requests" USING btree ("purge_after");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_deletion_requests_active_user" ON "user_deletion_requests" USING btree ("user_id") WHERE "user_deletion_requests"."cancelled_at" is null and "user_deletion_requests"."purged_at" is null;--> statement-breakpoint
CREATE INDEX "idx_user_moderation_logs_user_id" ON "user_moderation_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_moderation_logs_admin_id" ON "user_moderation_logs" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expires_at" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_last_seen_at" ON "user_sessions" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_verification_tokens_user_id" ON "verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_verification_tokens_token_hash" ON "verification_tokens" USING btree ("token_hash");