import { config as loadEnv } from "dotenv";
import { createHmac, randomBytes, scryptSync } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";

import { createDatabase } from "./client.js";
import { serverSupportedClients, serverTags, servers, users } from "./schema.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const packageRoot = path.resolve(currentDir, "..");
const repoRoot = path.resolve(packageRoot, "../..");

loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ path: path.join(packageRoot, ".env"), override: false });

const catalogSeedOwner = {
  email: "owner@firstspawn.local",
  username: "seed_owner",
};

const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const isLocalDatabase = (url: string): boolean => {
  try {
    return LOCAL_DB_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
};

/**
 * The seed owner is an active, email-confirmed, loginable account. Never bake a
 * usable credential for a non-local database: require SEED_OWNER_PASSWORD there,
 * and only fall back to a dev default when seeding a local DB.
 */
const resolveSeedOwnerPassword = (databaseUrl: string): string => {
  const fromEnv = process.env.SEED_OWNER_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (isLocalDatabase(databaseUrl)) return "FirstSpawnSeed123!";
  throw new Error(
    "Refusing to seed a non-local database without SEED_OWNER_PASSWORD. " +
      "Set SEED_OWNER_PASSWORD, or point the seed at a local database."
  );
};

const catalogServers = [
  {
    slug: "seed-hypixel",
    name: "Seed Hypixel",
    description: "Large public minigame network used as a reachable seed listing.",
    host: "mc.hypixel.net",
    port: 25565,
    owner: true,
    countryCode: "US",
    reachScope: "global",
    tags: ["Minigames", "PvP"],
  },
  {
    slug: "seed-cubecraft",
    name: "Seed CubeCraft",
    description: "Public minigame network for local collector smoke tests.",
    host: "play.cubecraft.net",
    port: 25565,
    owner: false,
    countryCode: "GB",
    reachScope: "global",
    tags: ["Minigames"],
  },
  {
    slug: "seed-minehut",
    name: "Seed Minehut",
    description: "Public Minecraft network seed row for discovery and vote testing.",
    host: "minehut.com",
    port: 25565,
    owner: false,
    countryCode: "US",
    reachScope: "global",
    tags: ["Survival", "Economy"],
  },
  {
    slug: "seed-wynncraft",
    name: "Seed Wynncraft",
    description: "RPG-focused public server seed row.",
    host: "play.wynncraft.com",
    port: 25565,
    owner: false,
    countryCode: "US",
    reachScope: "global",
    tags: ["RPG", "Quests"],
  },
] as const;

const b64UrlEncode = (value: Buffer): string => value.toString("base64url").replace(/=/g, "");

const hashSeedPassword = (password: string): string => {
  const n = 2 ** 14;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, { N: n, r, p });
  return `scrypt$${n}$${r}$${p}$${b64UrlEncode(salt)}$${b64UrlEncode(derived)}`;
};

const databaseUrl = (): string => {
  if (process.env.API_DATABASE_URL) {
    return process.env.API_DATABASE_URL.replace("postgresql+psycopg://", "postgresql://");
  }

  const dbUser = process.env.DB_USER ?? "firstspawn";
  const dbPassword = process.env.DB_PASSWORD ?? "firstspawn";
  const dbName = process.env.DB_NAME ?? "firstspawn";
  const dbHost = process.env.DB_HOST ?? "localhost";
  // Honor the published host port like drizzle.config.ts does; the container
  // maps POSTGRES_HOST_PORT (default 55432) -> 5432.
  const dbPort = process.env.POSTGRES_HOST_PORT || "55432";
  return `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${encodeURIComponent(dbName)}`;
};

const deterministicVerificationToken = (host: string): string => {
  const secret = process.env.API_TOKEN_HASH_SECRET ?? "dev-only-token-hash-secret-change-me";
  return `fs-seed-${createHmac("sha256", secret).update(host).digest("hex").slice(0, 12)}`;
};

const main = async (): Promise<void> => {
  const url = databaseUrl();
  const seedOwnerPassword = resolveSeedOwnerPassword(url);
  const db = createDatabase(url);
  const now = new Date();

  try {
    const [owner] = await db.db
      .insert(users)
      .values({
        email: catalogSeedOwner.email,
        username: catalogSeedOwner.username,
        passwordHash: hashSeedPassword(seedOwnerPassword),
        status: "active",
        role: "user",
        emailConfirmedAt: now,
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          status: "active",
          emailConfirmedAt: now,
          updatedAt: now,
        },
      })
      .returning({ id: users.id });

    const created: string[] = [];
    const updated: string[] = [];

    for (const seed of catalogServers) {
      const existing = await db.db.query.servers.findFirst({
        where: eq(servers.slug, seed.slug),
        columns: { id: true },
      });

      const baseValues = {
        slug: seed.slug,
        ownerId: seed.owner ? owner.id : null,
        name: seed.name,
        description: seed.description,
        host: seed.host,
        port: seed.port,
        game: "mc_java",
        status: "active",
        authMode: "official",
        countryCode: seed.countryCode,
        reachScope: seed.reachScope,
        verificationMethod: seed.owner ? "dns" : null,
        verificationToken: seed.owner ? deterministicVerificationToken(seed.host) : null,
        verifiedAt: seed.owner ? now : null,
        updatedAt: now,
      } satisfies typeof servers.$inferInsert;

      const serverId = await db.db.transaction(async (tx) => {
        if (existing) {
          const [row] = await tx
            .update(servers)
            .set(baseValues)
            .where(eq(servers.id, existing.id))
            .returning({ id: servers.id });
          updated.push(seed.slug);
          return row.id;
        }

        const [row] = await tx.insert(servers).values(baseValues).returning({ id: servers.id });
        created.push(seed.slug);
        return row.id;
      });

      await db.db
        .insert(serverSupportedClients)
        .values({
          serverId,
          clientName: "mc_java",
          clientVersion: "unknown",
          updatedAt: now,
        })
        .onConflictDoNothing();

      for (const tag of seed.tags) {
        await db.db
          .insert(serverTags)
          .values({ serverId, tag, updatedAt: now })
          .onConflictDoNothing();
      }
    }

    console.log(
      JSON.stringify(
        {
          owner: {
            email: catalogSeedOwner.email,
            username: catalogSeedOwner.username,
            // Only echo the credential for local dev; never print it for a
            // password supplied via SEED_OWNER_PASSWORD (shared/remote DB).
            password: process.env.SEED_OWNER_PASSWORD ? "(from SEED_OWNER_PASSWORD)" : seedOwnerPassword,
          },
          created,
          updated,
          total_seed_servers: catalogServers.length,
        },
        null,
        2
      )
    );
  } finally {
    await db.pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
