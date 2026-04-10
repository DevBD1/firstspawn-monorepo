import { describe, expect, it } from "vitest";
import { payloadDecision, shouldIncludePayload } from "../src/cadence.js";

describe("cadence", () => {
  it("includes payload when no previous payload exists", () => {
    expect(shouldIncludePayload(undefined, 1_000, 1800)).toBe(true);
  });

  it("skips payload before interval and includes after interval", () => {
    const last = 1_000;
    expect(shouldIncludePayload(last, last + 1_799_000, 1800)).toBe(false);
    expect(shouldIncludePayload(last, last + 1_800_000, 1800)).toBe(true);
  });

  it("returns payload decision with next payload timestamp", () => {
    const now = 5_000;
    const first = payloadDecision(undefined, now, 1800);
    expect(first.includePayload).toBe(true);
    expect(first.nextPayloadAtMs).toBe(now);

    const second = payloadDecision(now, now + 60_000, 1800);
    expect(second.includePayload).toBe(false);
    expect(second.nextPayloadAtMs).toBe(now);
  });
});
