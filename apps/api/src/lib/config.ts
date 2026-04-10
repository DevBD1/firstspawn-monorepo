import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const appRoot = path.resolve(currentDir, "../..");
const repoRoot = path.resolve(appRoot, "../..");

loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ path: path.join(appRoot, ".env"), override: false });

const parseCommaSeparatedList = (value: string): string[] =>
  value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const configSchema = z.object({
  API_ENV: z.string().default("development"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(8000),
  DB_HOST: z.string().default("localhost"),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  API_DATABASE_URL: z
    .string()
    .default("postgresql://firstspawn:firstspawn@localhost:5432/firstspawn"),
  API_REDIS_URL: z.string().default("redis://localhost:6379/0"),
  API_JWT_SECRET: z.string().default("dev-only-secret-change-me"),
  API_TOKEN_HASH_SECRET: z.string().default("dev-only-token-hash-secret-change-me"),
  API_JWT_ISSUER: z.string().default("firstspawn-api"),
  API_ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().int().positive().default(15),
  API_REFRESH_TOKEN_EXPIRE_DAYS: z.coerce.number().int().positive().default(30),
  API_ADMIN_EMAIL_ALLOWLIST: z.string().default("").transform(parseCommaSeparatedList),
  API_COLLECTOR_KEY: z.string().min(1).default("dev-only-collector-key-change-me"),
  API_TEST_DATABASE_URL: z.string().optional(),
  MAIL_USERNAME: z.string().default("admin@firstspawn.com"),
  MAIL_PASSWORD: z.string().default(""),
  MAIL_FROM: z.string().default("admin@firstspawn.com"),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SERVER: z.string().default("mailserver"),
  MAIL_STARTTLS: z.coerce.boolean().default(true),
  MAIL_SSL_TLS: z.coerce.boolean().default(false),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

export type AppConfig = z.infer<typeof configSchema> & {
  API_DATABASE_URL: string;
  API_TEST_DATABASE_URL?: string;
};

let cachedConfig: AppConfig | undefined;

const buildDatabaseUrlFromDiscreteEnv = (): string | null => {
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const host = process.env.DB_HOST ?? "localhost";

  if (!username || !password || !database) {
    return null;
  }

  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:5432/${encodeURIComponent(database)}`;
};

const expandDatabasePlaceholders = (url: string): string => {
  if (url.includes("${DB_")) {
    return (
      buildDatabaseUrlFromDiscreteEnv() ??
      "postgresql://firstspawn:firstspawn@localhost:5432/firstspawn"
    );
  }

  return url;
};

const normalizeDatabaseUrl = (url: string): string =>
  expandDatabasePlaceholders(url).replace("postgresql+psycopg://", "postgresql://");

export const getConfig = (): AppConfig => {
  if (!cachedConfig) {
    const parsed = configSchema.parse(process.env);
    const explicitConnectionString =
      buildDatabaseUrlFromDiscreteEnv() ?? normalizeDatabaseUrl(parsed.API_DATABASE_URL);
    cachedConfig = {
      ...parsed,
      API_DATABASE_URL: explicitConnectionString,
      API_TEST_DATABASE_URL: parsed.API_TEST_DATABASE_URL
        ? normalizeDatabaseUrl(parsed.API_TEST_DATABASE_URL)
        : undefined,
    };
  }

  return cachedConfig;
};

export const resetConfigForTests = (): void => {
  cachedConfig = undefined;
};
