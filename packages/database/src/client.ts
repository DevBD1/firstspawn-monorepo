import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema.js";

export interface DatabaseContext {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
}

// Bound how long acquiring a connection may block. With the default (0 = wait
// forever), a query issued while Postgres is unreachable hangs indefinitely —
// so under a sustained outage the /healthz poll's `SELECT 1` would keep piling
// up stalled connection attempts every cycle. A few seconds caps that and lets
// the health check's own 2s race report `db:false` cleanly.
const CONNECTION_TIMEOUT_MS = 5_000;

/** Converts a PostgreSQL connection string into the discrete `pg` pool options used by services. */
export const toPoolConfig = (connectionString: string): PoolConfig => {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port ? Number.parseInt(url.port, 10) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    options: url.searchParams.get("options") ?? undefined,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  };
};

/** Creates the shared Drizzle and `pg` database context for FirstSpawn services. */
export const createDatabase = (connectionString: string): DatabaseContext => {
  const pool = new Pool(toPoolConfig(connectionString));

  // Without an 'error' listener, an idle-client error (e.g. Postgres restarting
  // or a dropped connection) is emitted as an unhandled error and crashes the
  // process — which would take the API down instead of letting /healthz report
  // the database as unavailable. Log and let the pool recover on the next query.
  pool.on("error", (err) => {
    console.error("Postgres pool error:", err);
  });

  return {
    pool,
    db: drizzle(pool, { schema }),
  };
};
