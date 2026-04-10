import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema.js";

export interface DatabaseContext {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
}

export const toPoolConfig = (connectionString: string): PoolConfig => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port ? Number.parseInt(url.port, 10) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    options: url.searchParams.get("options") ?? undefined,
  };
};

export const createDatabase = (connectionString: string): DatabaseContext => {
  const pool = new Pool(toPoolConfig(connectionString));

  return {
    pool,
    db: drizzle(pool, { schema }),
  };
};
