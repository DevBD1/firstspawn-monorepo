import { sql } from "drizzle-orm";
import {
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

function uuidv7(): string {
  const ts = Date.now();
  const hexTs = ts.toString(16).padStart(12, "0");
  const randA = Math.floor(Math.random() * 0x1000)
    .toString(16)
    .padStart(3, "0");
  const variant = (Math.floor(Math.random() * 4) + 8).toString(16);
  const randBHigh = Math.floor(Math.random() * 0x1000)
    .toString(16)
    .padStart(3, "0");
  const randB = Math.floor(Math.random() * 0x1000000000000)
    .toString(16)
    .padStart(12, "0");

  return `${hexTs.slice(0, 8)}-${hexTs.slice(8, 12)}-7${randA}-${variant}${randBHigh}-${randB}`;
}

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
      .$defaultFn(() => uuidv7()),
    email: citext("email").notNull(),
    username: citext("username").notNull(),
    avatarUrl: varchar("avatar_url", { length: 2048 }),

    passwordHash: text("password_hash"),

    status: varchar("status", { length: 20 }).notNull().default("active"),
    role: varchar("role", { length: 20 }).notNull().default("user"),
    locale: varchar("locale", { length: 10 }),
    countryCode: varchar("country_code", { length: 2 }).references(() => countries.isoA2),

    emailConfirmedAt: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),
    marketingConsentAt: timestamp("marketing_consent_at", {
      withTimezone: true,
      mode: "date",
    }),
    privacyAcceptedAt: timestamp("privacy_accepted_at", {
      withTimezone: true,
      mode: "date",
    }),
    termsAcceptedAt: timestamp("terms_accepted_at", {
      withTimezone: true,
      mode: "date",
    }),

    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "date",
    }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username),
    check("chk_users_username_format", sql`${table.username}::text ~ '^[A-Za-z0-9_]{3,32}$'`),
    check("chk_users_status", sql`${table.status} in ('active', 'suspended', 'deleted')`),
    check("chk_users_role", sql`${table.role} in ('user', 'moderator', 'admin')`),
  ]
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
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

export const userConsentAuditLogs = pgTable(
  "user_consent_audit_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    ip: inet("ip"),
    userAgent: text("user_agent"),

    action: varchar("action", { length: 20 }).notNull(),
    consentType: varchar("consent_type", { length: 50 }).notNull(),
    policyVersion: varchar("policy_version", { length: 20 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_consent_audit_logs_user_id").on(table.userId),
    check("chk_user_consent_audit_logs_action", sql`${table.action} in ('opt_in', 'opt_out')`),
    check(
      "chk_user_consent_audit_logs_type",
      sql`${table.consentType} in ('marketing', 'privacy', 'terms')`
    ),
  ]
);

export const userDeletionRequests = pgTable(
  "user_deletion_requests",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
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

export const userModerationLogs = pgTable(
  "user_moderation_logs",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),

    action: varchar("action", { length: 20 }).notNull(),
    reason: text("reason"),

    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),

    ...timestamps,
  },
  (table) => [
    index("idx_user_moderation_logs_user_id").on(table.userId),
    index("idx_user_moderation_logs_admin_id").on(table.adminId),
    check(
      "chk_user_moderation_logs_action",
      sql`${table.action} in ('suspended', 'unsuspended', 'warned')`
    ),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
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

export const countries = pgTable(
  "countries",
  {
    isoA2: varchar("iso_a_2", { length: 2 }).primaryKey(),
    isoA3: varchar("iso_a_3", { length: 3 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => [uniqueIndex("countries_name_unique").on(table.name)]
);

export const servers = pgTable(
  "servers",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    slug: citext("slug").notNull(),

    ownerId: uuid("owner_id").references(() => users.id, { onDelete: "set null" }),

    name: varchar("name", { length: 64 }).notNull(),
    description: text("description").notNull(),
    host: varchar("host", { length: 255 }).notNull(),
    port: integer("port").notNull(),

    game: varchar("game", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),

    authMode: varchar("auth_mode", { length: 20 }).notNull().default("unknown"),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.isoA2),

    logoUrl: varchar("logo_url", { length: 2048 }),
    bannerUrl: varchar("banner_url", { length: 2048 }),

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
    uniqueIndex("servers_name_unique").on(table.name),
    index("idx_servers_owner_id").on(table.ownerId),
    index("idx_servers_status").on(table.status),
    index("idx_servers_game").on(table.game),
    index("idx_servers_probe_status").on(table.probeStatus),
    check("chk_servers_port", sql`${table.port} between 1 and 65535`),
    check("chk_servers_game", sql`${table.game} in ('mc_java', 'mc_bedrock', 'hytale')`),
    check("chk_servers_status", sql`${table.status} in ('active', 'suspended', 'archived')`),
    check(
      "chk_servers_auth_mode",
      sql`${table.authMode} in ('official', 'offline_allowed', 'unknown')`
    ),
    check(
      "chk_servers_probe_status",
      sql`${table.probeStatus} in ('online', 'offline', 'unknown', 'unreachable')`
    ),
    check("chk_servers_consecutive_probe_failures", sql`${table.consecutiveProbeFailures} >= 0`),
  ]
);

export const serverSocials = pgTable(
  "server_socials",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),

    platform: varchar("platform", { length: 50 }).notNull(),
    url: varchar("url", { length: 2048 }).notNull(),
    displayOrder: integer("display_order").notNull().default(0),

    ...timestamps,
  },
  (table) => [
    primaryKey({ columns: [table.serverId, table.platform], name: "pk_server_socials" }),
    index("idx_server_socials_server_id").on(table.serverId),
    check(
      "chk_server_socials_platform",
      sql`${table.platform} in ('website', 'discord', 'youtube', 'twitter', 'instagram', 'tiktok', 'facebook')`
    ),
  ]
);

export const serverSupportedClients = pgTable(
  "server_supported_clients",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),

    clientName: varchar("client_name", { length: 20 }).notNull(),
    clientVersion: varchar("client_version", { length: 50 }).notNull(),

    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.serverId, table.clientName, table.clientVersion],
      name: "pk_server_supported_clients",
    }),
    index("idx_server_supported_clients_server_id").on(table.serverId),
    check(
      "chk_server_supported_clients_client_name",
      sql`${table.clientName} in ('mc_java', 'mc_bedrock', 'hytale')`
    ),
  ]
);

export const serverHeartbeats = pgTable(
  "server_heartbeats",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
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

export const serverModerationLogs = pgTable(
  "server_moderation_logs",
  {
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
    serverId: uuid("server_id").references(() => servers.id, { onDelete: "set null" }),
    adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 20 }).notNull(),
    reason: text("reason"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    index("idx_server_moderation_logs_server_id").on(table.serverId),
    index("idx_server_moderation_logs_admin_id").on(table.adminId),
    check(
      "chk_server_moderation_logs_action",
      sql`${table.action} in ('suspended', 'unsuspended', 'warned')`
    ),
  ]
);

export type UserRecord = typeof users.$inferSelect;
