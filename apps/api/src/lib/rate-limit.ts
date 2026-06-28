import type { RedisClient } from "./redis.js";
import { withTimeout } from "./timeout.js";

// A stalled (vs. cleanly unreachable) Redis must not hold the request open —
// cap the op so we fail open promptly rather than blocking auth/votes.
const REDIS_OP_TIMEOUT_MS = 1_000;

// Sliding window using Redis INCR + EXPIRE.
// Returns true if the request is allowed, false if rate-limited.
export async function checkRateLimit(
  redis: RedisClient,
  key: string, // e.g. "rl:auth_login:127.0.0.1"
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const result = await withTimeout(
      redis.multi().incr(key).expire(key, windowSeconds, "NX").exec(),
      REDIS_OP_TIMEOUT_MS,
      "rate-limit redis"
    );
    const count = result?.[0]?.[1];

    if (typeof count !== "number") {
      throw new Error("Rate limit increment failed.");
    }

    return count <= maxRequests;
  } catch {
    // Fail-open: if Redis crashes or is unreachable, allow the request.
    return true;
  }
}
