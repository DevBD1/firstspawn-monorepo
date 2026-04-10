import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

import { getConfig } from "../src/lib/config.js";
import {
  decodeAccessToken,
  decodeRefreshToken,
  hashPassword,
  hashRefreshToken,
  issueAccessToken,
  issueRefreshToken,
  verifyPassword,
} from "../src/lib/security.js";

describe("security helpers", () => {
  it("round-trips password hashing", () => {
    const password = "StrongPassword123!";
    const encoded = hashPassword(password);

    expect(verifyPassword(password, encoded)).toBe(true);
    expect(verifyPassword("wrong-password", encoded)).toBe(false);
  });

  it("issues and decodes access tokens", () => {
    const userId = randomUUID();
    const { token, expiresIn } = issueAccessToken(userId, getConfig());
    const claims = decodeAccessToken(token, getConfig());

    expect(claims.sub).toBe(userId);
    expect(claims.typ).toBe("access");
    expect(expiresIn).toBeGreaterThan(0);
  });

  it("issues and decodes refresh tokens", () => {
    const userId = randomUUID();
    const sessionId = randomUUID();
    const config = getConfig();
    const { token } = issueRefreshToken(userId, sessionId, getConfig());
    const claims = decodeRefreshToken(token, config);

    expect(claims.sub).toBe(userId);
    expect(claims.sid).toBe(sessionId);
    expect(hashRefreshToken(token, config)).not.toBe(token);
  });
});
