import { Redis } from "ioredis";

type ExpireMode = "NX";

export interface RedisMulti {
  incr(key: string): RedisMulti;
  expire(key: string, seconds: number, mode?: ExpireMode): RedisMulti;
  exec(): Promise<Array<[Error | null, unknown]> | null>;
}

export interface RedisPipeline {
  set(key: string, value: string, expiryMode?: "EX", time?: number): RedisPipeline;
  exec(): Promise<Array<[Error | null, unknown]> | null>;
}

export interface RedisClient {
  multi(): RedisMulti;
  quit(): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, expiryMode?: "EX", time?: number): Promise<string | null>;
  mget(...keys: string[]): Promise<(string | null)[]>;
  pipeline(): RedisPipeline;
}

interface InMemoryStoreEntry {
  count?: number;
  value?: string;
  expiresAt: number | null;
}

class InMemoryRedisMulti implements RedisMulti {
  private readonly commands: Array<() => [Error | null, unknown]> = [];

  constructor(private readonly store: Map<string, InMemoryStoreEntry>) {}

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

class InMemoryRedisPipeline implements RedisPipeline {
  private readonly commands: Array<() => [Error | null, unknown]> = [];

  constructor(private readonly store: Map<string, InMemoryStoreEntry>) {}

  set(key: string, value: string, expiryMode?: "EX", time?: number): RedisPipeline {
    this.commands.push(() => {
      const expiresAt = expiryMode === "EX" && time ? Date.now() + time * 1000 : null;
      this.store.set(key, { value, expiresAt });
      return [null, "OK"];
    });
    return this;
  }

  async exec(): Promise<Array<[Error | null, unknown]>> {
    return this.commands.map((command) => command());
  }
}

class InMemoryRedisClient implements RedisClient {
  private readonly store = new Map<string, InMemoryStoreEntry>();

  multi(): RedisMulti {
    return new InMemoryRedisMulti(this.store);
  }

  async quit(): Promise<"OK"> {
    this.store.clear();
    return "OK";
  }

  async get(key: string): Promise<string | null> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= now) {
      this.store.delete(key);
      return null;
    }

    return entry.value ?? null;
  }

  async set(key: string, value: string, expiryMode?: "EX", time?: number): Promise<"OK"> {
    const expiresAt = expiryMode === "EX" && time ? Date.now() + time * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    const results: (string | null)[] = [];
    for (const key of keys) {
      results.push(await this.get(key));
    }
    return results;
  }

  pipeline(): RedisPipeline {
    return new InMemoryRedisPipeline(this.store);
  }
}

export function createRedisClient(url: string): RedisClient {
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  // Prevent unhandled error crashes if redis is unreachable.
  client.on("error", (err) => {
    console.error("Redis Error:", err);
  });

  return client as unknown as RedisClient;
}

export function createInMemoryRedisClient(): RedisClient {
  return new InMemoryRedisClient();
}
