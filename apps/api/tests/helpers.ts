import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";

import { buildApp } from "../src/server.js";
import { createDatabase, toPoolConfig } from "../src/db/client.js";
import { resetConfigForTests } from "../src/lib/config.js";
import { createInMemoryRedisClient } from "../src/lib/redis.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const migrationsFolder = path.resolve(currentDir, "../../../packages/database/migrations");

const normalizeTestDatabaseUrl = (connectionString: string): string => {
  const synthesized = connectionString.includes("${DB_")
    ? `postgresql://${encodeURIComponent(process.env.DB_USER ?? "firstspawn")}:${encodeURIComponent(
        process.env.DB_PASSWORD ?? "firstspawn"
      )}@localhost:5432/${encodeURIComponent(process.env.DB_NAME ?? "firstspawn")}`
    : connectionString;
  const normalized = synthesized.replace("postgresql+psycopg://", "postgresql://");
  const url = new URL(normalized);

  if (url.hostname === "postgres") {
    url.hostname = "localhost";
  }

  return url.toString();
};

export interface TestMailerSpy {
  verificationEmails: Array<{ emailTo: string; rawToken: string; locale?: string }>;
  restoreEmails: Array<{ emailTo: string; rawToken: string; purgeAfter: Date; locale?: string }>;
}

export interface TestContext {
  app: Awaited<ReturnType<typeof buildApp>>;
  mailer: TestMailerSpy;
  close(): Promise<void>;
}

export const createTestApp = async (): Promise<TestContext> => {
  const baseUrl =
    process.env.API_TEST_DATABASE_URL ??
    `postgresql://${encodeURIComponent(process.env.DB_USER ?? "firstspawn")}:${encodeURIComponent(
      process.env.DB_PASSWORD ?? "firstspawn"
    )}@localhost:5432/${encodeURIComponent(process.env.DB_NAME ?? "firstspawn")}`;
  const normalizedBaseUrl = normalizeTestDatabaseUrl(baseUrl);
  const schemaName = `test_api_${randomUUID().replaceAll("-", "")}`;

  const adminPool = new Pool(toPoolConfig(normalizedBaseUrl));
  await adminPool.query('create extension if not exists "uuid-ossp"');
  await adminPool.query('create extension if not exists "citext"');
  await adminPool.query(`create schema "${schemaName}"`);

  const testUrlObject = new URL(normalizedBaseUrl);
  testUrlObject.searchParams.set("options", `-c search_path=${schemaName},public`);
  const testUrl = testUrlObject.toString();

  process.env.API_ENV = "test";
  process.env.API_DATABASE_URL = testUrl;
  process.env.API_ADMIN_EMAIL_ALLOWLIST = "admin@example.com";
  process.env.API_COLLECTOR_KEY = "test-collector-key";
  resetConfigForTests();

  const db = createDatabase(testUrl);
  await migrate(db.db, {
    migrationsFolder,
    migrationsSchema: schemaName,
    migrationsTable: `__drizzle_migrations_${schemaName}`,
  });

  const mailer: TestMailerSpy = {
    verificationEmails: [],
    restoreEmails: [],
  };

  const app = await buildApp({
    db,
    redis: createInMemoryRedisClient(),
    mailer: {
      async sendVerificationEmail(
        emailTo: string,
        rawToken: string,
        locale?: string
      ): Promise<void> {
        mailer.verificationEmails.push({ emailTo, rawToken, locale });
      },
      async sendAccountRestoreEmail(
        emailTo: string,
        rawToken: string,
        purgeAfter: Date,
        locale?: string
      ): Promise<void> {
        mailer.restoreEmails.push({ emailTo, rawToken, purgeAfter, locale });
      },
    },
  });

  return {
    app,
    mailer,
    async close(): Promise<void> {
      await app.close();
      await adminPool.query(`drop schema if exists "${schemaName}" cascade`);
      await adminPool.end();
    },
  };
};
