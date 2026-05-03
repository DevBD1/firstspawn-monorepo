import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

const inet = customType<{ data: string }>({
  dataType() {
    return "inet";
  },
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    email: citext("email").notNull(),
    emailConfirmedAt: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),
    username: citext("username").notNull(),
    passwordHash: text("password_hash"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    locale: varchar("locale", { length: 10 }).notNull().default("en"),
    termsAccepted: timestamp("terms_accepted", {
      withTimezone: true,
      mode: "date",
    }),
    privacyAccepted: timestamp("privacy_accepted", {
      withTimezone: true,
      mode: "date",
    }),
    marketingConsent: timestamp("marketing_consent", {
      withTimezone: true,
      mode: "date",
    }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
    check("chk_users_status", sql`${table.status} in ('active', 'suspended', 'deleted')`),
    check("chk_users_locale", sql`${table.locale} in ('en', 'tr', 'de', 'ru', 'es', 'fr')`),
    check("chk_users_username_format", sql`${table.username}::text ~ '^[A-Za-z0-9_]{3,32}$'`),
  ]
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshTokenHash: text("refresh_token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    ip: inet("ip"),
    userAgent: text("user_agent"),
    deviceFingerprintHash: text("device_fingerprint_hash"),
    deviceType: varchar("device_type", { length: 50 }),
    osName: varchar("os_name", { length: 100 }),
    clientName: varchar("client_name", { length: 100 }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    index("idx_user_sessions_user_id").on(table.userId),
    index("idx_user_sessions_expires_at").on(table.expiresAt),
    index("idx_user_sessions_last_seen_at").on(table.lastSeenAt),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    purpose: varchar("purpose", { length: 50 }).notNull().default("email_verification"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("idx_verification_tokens_user_id").on(table.userId),
    uniqueIndex("idx_verification_tokens_token_hash").on(table.tokenHash),
    check(
      "chk_verification_tokens_purpose",
      sql`${table.purpose} in ('email_verification', 'password_reset', 'account_restore')`
    ),
  ]
);

export const userDeletionRequests = pgTable(
  "user_deletion_requests",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedAt: timestamp("requested_at", { withTimezone: true, mode: "date" }).notNull(),
    purgeAfter: timestamp("purge_after", { withTimezone: true, mode: "date" }).notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "date" }),
    purgedAt: timestamp("purged_at", { withTimezone: true, mode: "date" }),
    expediteRequestedAt: timestamp("expedite_requested_at", { withTimezone: true, mode: "date" }),
    expediteNote: text("expedite_note"),
    reason: text("reason"),
    ...timestamps,
  },
  (table) => [
    index("idx_user_deletion_requests_user_id").on(table.userId),
    index("idx_user_deletion_requests_purge_after").on(table.purgeAfter),
    uniqueIndex("idx_user_deletion_requests_active_user")
      .on(table.userId)
      .where(sql`${table.cancelledAt} is null and ${table.purgedAt} is null`),
    check(
      "chk_user_deletion_requests_purge_after",
      sql`${table.purgeAfter} > ${table.requestedAt}`
    ),
  ]
);

export const servers = pgTable(
  "servers",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    slug: citext("slug").notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    description: text("description").notNull(),
    host: varchar("host", { length: 255 }).notNull(),
    port: integer("port").notNull(),
    game: varchar("game", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    onlineMode: boolean("online_mode").notNull().default(true),
    region: varchar("region", { length: 50 }),
    websiteUrl: varchar("website_url", { length: 2048 }),
    discordUrl: varchar("discord_url", { length: 2048 }),
    lastPingAt: timestamp("last_ping_at", { withTimezone: true, mode: "date" }),
    lastProbeAttemptAt: timestamp("last_probe_attempt_at", { withTimezone: true, mode: "date" }),
    lastProbeSuccessAt: timestamp("last_probe_success_at", { withTimezone: true, mode: "date" }),
    lastProbeFailureAt: timestamp("last_probe_failure_at", { withTimezone: true, mode: "date" }),
    consecutiveProbeFailures: integer("consecutive_probe_failures").notNull().default(0),
    lastProbeErrorCode: varchar("last_probe_error_code", { length: 80 }),
    probeStatus: varchar("probe_status", { length: 20 }).notNull().default("unknown"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("servers_slug_unique").on(table.slug),
    index("idx_servers_status").on(table.status),
    index("idx_servers_game").on(table.game),
    index("idx_servers_probe_status").on(table.probeStatus),
    check("chk_servers_port", sql`${table.port} between 1 and 65535`),
    check("chk_servers_game", sql`${table.game} in ('mc_java', 'mc_bedrock', 'hytale')`),
    check("chk_servers_status", sql`${table.status} in ('active', 'suspended', 'archived')`),
    check(
      "chk_servers_probe_status",
      sql`${table.probeStatus} in ('online', 'offline', 'unknown', 'unreachable')`
    ),
    check("chk_servers_consecutive_probe_failures", sql`${table.consecutiveProbeFailures} >= 0`),
  ]
);

export const serverHeartbeats = pgTable(
  "server_heartbeats",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" }).notNull(),
    collectedAt: timestamp("collected_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    uptimeSeconds: integer("uptime_seconds"),
    pingMs: smallint("ping_ms"),
    onlinePlayers: integer("online_players"),
    maxPlayers: integer("max_players"),
    payload: jsonb("payload"),
    protocolVersion: integer("protocol_version"),
    minecraftVersion: varchar("minecraft_version", { length: 50 }),
    idempotencyKey: text("idempotency_key"),
    ...timestamps,
  },
  (table) => [
    index("idx_server_heartbeats_server_id").on(table.serverId),
    index("idx_server_heartbeats_occurred_at").on(table.occurredAt),
    index("idx_server_heartbeats_server_occurred").on(table.serverId, table.occurredAt),
    index("idx_server_heartbeats_server_latest").on(
      table.serverId,
      table.occurredAt.desc(),
      table.createdAt.desc(),
      table.id.desc()
    ),
    uniqueIndex("idx_server_heartbeats_server_idempotency").on(
      table.serverId,
      table.idempotencyKey
    ),
    check("chk_server_heartbeats_ping_ms", sql`${table.pingMs} is null or ${table.pingMs} >= 0`),
    check(
      "chk_server_heartbeats_players",
      sql`${table.onlinePlayers} is null or ${table.onlinePlayers} >= 0`
    ),
    check(
      "chk_server_heartbeats_max_players",
      sql`${table.maxPlayers} is null or ${table.maxPlayers} >= 0`
    ),
    check(
      "chk_server_heartbeats_player_bounds",
      sql`${table.onlinePlayers} is null or ${table.maxPlayers} is null or ${table.onlinePlayers} <= ${table.maxPlayers}`
    ),
    check(
      "chk_server_heartbeats_uptime_seconds",
      sql`${table.uptimeSeconds} is null or ${table.uptimeSeconds} >= 0`
    ),
  ]
);

export const serverHeartbeatHourly = pgTable(
  "server_heartbeat_hourly",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    bucketStart: timestamp("bucket_start", { withTimezone: true, mode: "date" }).notNull(),
    sampleCount: integer("sample_count").notNull().default(0),
    payloadCount: integer("payload_count").notNull().default(0),
    pingMinMs: smallint("ping_min_ms"),
    pingMaxMs: smallint("ping_max_ms"),
    pingAvgMs: numeric("ping_avg_ms", { precision: 10, scale: 2 }),
    uptimeMaxSeconds: integer("uptime_max_seconds"),
    playersPeak: integer("players_peak"),
    maxPlayersPeak: integer("max_players_peak"),
    lastOccurredAt: timestamp("last_occurred_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.serverId, table.bucketStart],
      name: "pk_server_heartbeat_hourly",
    }),
    index("idx_server_heartbeat_hourly_bucket_start").on(table.bucketStart),
    check("chk_server_heartbeat_hourly_sample_count", sql`${table.sampleCount} >= 0`),
    check("chk_server_heartbeat_hourly_payload_count", sql`${table.payloadCount} >= 0`),
  ]
);

export const serverHeartbeatDaily = pgTable(
  "server_heartbeat_daily",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    bucketDate: date("bucket_date", { mode: "date" }).notNull(),
    sampleCount: integer("sample_count").notNull().default(0),
    payloadCount: integer("payload_count").notNull().default(0),
    pingMinMs: smallint("ping_min_ms"),
    pingMaxMs: smallint("ping_max_ms"),
    pingAvgMs: numeric("ping_avg_ms", { precision: 10, scale: 2 }),
    uptimeMaxSeconds: integer("uptime_max_seconds"),
    playersPeak: integer("players_peak"),
    maxPlayersPeak: integer("max_players_peak"),
    lastOccurredAt: timestamp("last_occurred_at", { withTimezone: true, mode: "date" }).notNull(),
    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.serverId, table.bucketDate], name: "pk_server_heartbeat_daily" }),
    index("idx_server_heartbeat_daily_bucket_date").on(table.bucketDate),
    check("chk_server_heartbeat_daily_sample_count", sql`${table.sampleCount} >= 0`),
    check("chk_server_heartbeat_daily_payload_count", sql`${table.payloadCount} >= 0`),
  ]
);

export type UserRecord = typeof users.$inferSelect;
