import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const repoRoot = path.resolve(currentDir, "../..");

loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ path: path.join(currentDir, ".env"), override: false });

const buildDatabaseUrlFromDiscreteEnv = (host: string): string | null => {
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;

  if (!username || !password || !database) {
    return null;
  }

  const port = host === "localhost" ? process.env.POSTGRES_HOST_PORT || "55432" : "5432";
  return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
};

const expandDatabasePlaceholders = (url: string): string => {
  if (url.includes("${DB_")) {
    const host = url.includes("@postgres:") ? "postgres" : "localhost";
    return (
      buildDatabaseUrlFromDiscreteEnv(host) ??
      "postgresql://firstspawn:firstspawn@localhost:5432/firstspawn"
    );
  }

  return url;
};

const normalizeDatabaseUrl = (url: string): string =>
  expandDatabasePlaceholders(url).replace("postgresql+psycopg://", "postgresql://");

const connectionString =
  buildDatabaseUrlFromDiscreteEnv("localhost") ??
  normalizeDatabaseUrl(
    process.env.API_DATABASE_URL ?? "postgresql://firstspawn:firstspawn@localhost:5432/firstspawn"
  );

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: connectionString,
  },
});
