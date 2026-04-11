import { Redis } from "ioredis";

type ExpireMode = "NX";

export interface RedisMulti {
  incr(key: string): RedisMulti;
  expire(key: string, seconds: number, mode?: ExpireMode): RedisMulti;
  exec(): Promise<Array<[Error | null, unknown]> | null>;
}

export interface RedisClient {
  multi(): RedisMulti;
  quit(): Promise<unknown>;
}

class InMemoryRedisMulti implements RedisMulti {
  private readonly commands: Array<() => [Error | null, unknown]> = [];

  constructor(private readonly store: Map<string, { count: number; expiresAt: number | null }>) {}

  incr(key: string): RedisMulti {
    this.commands.push(() => {
      const now = Date.now();
      const entry = this.store.get(key);

      if (entry && entry.expiresAt !== null && entry.expiresAt <= now) {
        this.store.delete(key);
      }

      const next = (this.store.get(key)?.count ?? 0) + 1;
      const expiresAt = this.store.get(key)?.expiresAt ?? null;
      this.store.set(key, { count: next, expiresAt });
      return [null, next];
    });

    return this;
  }

  expire(key: string, seconds: number, mode?: ExpireMode): RedisMulti {
    this.commands.push(() => {
      const now = Date.now();
      const entry = this.store.get(key);

      if (!entry || (entry.expiresAt !== null && entry.expiresAt <= now)) {
        this.store.delete(key);
        return [null, 0];
      }

      if (mode === "NX" && entry.expiresAt !== null) {
        return [null, 0];
      }

      entry.expiresAt = now + seconds * 1000;
      this.store.set(key, entry);
      return [null, 1];
    });

    return this;
  }

  async exec(): Promise<Array<[Error | null, unknown]>> {
    return this.commands.map((command) => command());
  }
}

class InMemoryRedisClient implements RedisClient {
  private readonly store = new Map<string, { count: number; expiresAt: number | null }>();

  multi(): RedisMulti {
    return new InMemoryRedisMulti(this.store);
  }

  async quit(): Promise<"OK"> {
    this.store.clear();
    return "OK";
  }
}

export function createRedisClient(url: string): RedisClient {
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  // Prevent unhandled error crashes if redis is unreachable.
  client.on("error", () => {});

  return client;
}

export function createInMemoryRedisClient(): RedisClient {
  return new InMemoryRedisClient();
}
