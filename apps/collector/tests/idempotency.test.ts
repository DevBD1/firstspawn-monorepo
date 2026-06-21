import { describe, expect, it } from "vitest";
import { buildHeartbeatIdempotencyKey } from "../src/idempotency.js";

describe("idempotency key", () => {
  it("builds stable mcjava key format", () => {
    const key = buildHeartbeatIdempotencyKey(
      "2f7f3d97-7d8b-4a26-a1f4-64812f31b902",
      "2026-04-10T08:00:00.000Z"
    );
    expect(key).toBe("mcjava:2f7f3d97-7d8b-4a26-a1f4-64812f31b902:2026-04-10T08:00:00.000Z");
  });
});
