import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import type { AppConfig } from "./config.js";

export class TokenDecodeError extends Error {}

const b64UrlEncode = (value: Buffer): string => value.toString("base64url").replace(/=/g, "");

const b64UrlDecode = (value: string): Buffer => Buffer.from(value, "base64url");

const jsonCompact = (payload: Record<string, unknown>): Buffer => {
  const sortedEntries = Object.entries(payload).sort(([left], [right]) =>
    left.localeCompare(right)
  );
  return Buffer.from(JSON.stringify(Object.fromEntries(sortedEntries)));
};

const hashWithPurpose = (token: string, purpose: string, secret: string): string =>
  createHmac("sha256", secret).update(`${purpose}:${token}`).digest("hex");

const encodeJwt = <T extends object>(payload: T, secret: string): string => {
  const headerPart = b64UrlEncode(jsonCompact({ alg: "HS256", typ: "JWT" }));
  const payloadPart = b64UrlEncode(jsonCompact(payload as Record<string, unknown>));
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest();
  return `${signingInput}.${b64UrlEncode(signature)}`;
};

const decodeJwt = (token: string, secret: string): Record<string, unknown> => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new TokenDecodeError("Malformed token.");
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const signingInput = `${headerPart}.${payloadPart}`;
  const expectedSignature = createHmac("sha256", secret).update(signingInput).digest();
  const providedSignature = b64UrlDecode(signaturePart);

  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    throw new TokenDecodeError("Invalid token signature.");
  }

  const payload = JSON.parse(b64UrlDecode(payloadPart).toString("utf8"));
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new TokenDecodeError("Invalid payload.");
  }

  const exp = payload.exp;
  if (typeof exp !== "number") {
    throw new TokenDecodeError("Missing expiration.");
  }

  if (exp <= Math.floor(Date.now() / 1000)) {
    throw new TokenDecodeError("Token expired.");
  }

  return payload as Record<string, unknown>;
};

export const hashPassword = (password: string): string => {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const n = 2 ** 14;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64, {
    N: n,
    r,
    p,
  });

  return `scrypt$${n}$${r}$${p}$${b64UrlEncode(salt)}$${b64UrlEncode(derived)}`;
};

export const verifyPassword = (password: string, encodedHash: string | null): boolean => {
  if (!encodedHash) {
    return false;
  }

  try {
    const [algorithm, nRaw, rRaw, pRaw, saltRaw, digestRaw] = encodedHash.split("$");
    if (algorithm !== "scrypt") {
      return false;
    }

    const expected = b64UrlDecode(digestRaw);
    const actual = scryptSync(password, b64UrlDecode(saltRaw), expected.length, {
      N: Number.parseInt(nRaw, 10),
      r: Number.parseInt(rRaw, 10),
      p: Number.parseInt(pRaw, 10),
    });

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
};

export const hashRefreshToken = (
  token: string,
  config: Pick<AppConfig, "API_TOKEN_HASH_SECRET">
): string => hashWithPurpose(token, "refresh", config.API_TOKEN_HASH_SECRET);

export const hashToken = (
  token: string,
  config: Pick<AppConfig, "API_TOKEN_HASH_SECRET">
): string => hashWithPurpose(token, "generic", config.API_TOKEN_HASH_SECRET);

export interface AccessClaims {
  iss: string;
  sub: string;
  typ: "access";
  iat: number;
  exp: number;
}

export interface RefreshClaims {
  iss: string;
  sub: string;
  sid: string;
  typ: "refresh";
  iat: number;
  exp: number;
}

export const issueAccessToken = (
  userId: string,
  config: AppConfig
): { token: string; expiresIn: number } => {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = config.API_ACCESS_TOKEN_EXPIRE_MINUTES * 60;
  const payload: AccessClaims = {
    iss: config.API_JWT_ISSUER,
    sub: userId,
    typ: "access",
    iat: now,
    exp: now + expiresIn,
  };

  return {
    token: encodeJwt(payload, config.API_JWT_SECRET),
    expiresIn,
  };
};

export const issueRefreshToken = (
  userId: string,
  sessionId: string,
  config: AppConfig
): { token: string; expiresAt: Date } => {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date(Date.now() + config.API_REFRESH_TOKEN_EXPIRE_DAYS * 86400_000);
  const payload: RefreshClaims = {
    iss: config.API_JWT_ISSUER,
    sub: userId,
    sid: sessionId,
    typ: "refresh",
    iat: now,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  return {
    token: encodeJwt(payload, config.API_JWT_SECRET),
    expiresAt,
  };
};

export const decodeAccessToken = (token: string, config: AppConfig): AccessClaims => {
  const payload = decodeJwt(token, config.API_JWT_SECRET);
  if (payload.typ !== "access") {
    throw new TokenDecodeError("Unexpected token type.");
  }
  return payload as unknown as AccessClaims;
};

export const decodeRefreshToken = (token: string, config: AppConfig): RefreshClaims => {
  const payload = decodeJwt(token, config.API_JWT_SECRET);
  if (payload.typ !== "refresh") {
    throw new TokenDecodeError("Unexpected token type.");
  }
  return payload as unknown as RefreshClaims;
};

const LISTING_VERIFY_PURPOSE = "listing-verify";
const LISTING_OWNERSHIP_TYP = "listing_ownership" as const;
const LISTING_OWNERSHIP_TTL_SECONDS = 15 * 60;

export interface ListingVerificationTarget {
  userId: string;
  host: string;
  port: number;
}

/**
 * Derives the deterministic ownership-verification token a server owner pastes
 * into their MOTD or a DNS TXT record. The same (user, host, port) always maps
 * to the same token, so it can be shown and re-derived without persistence.
 */
export const deriveListingVerificationToken = (
  target: ListingVerificationTarget,
  config: Pick<AppConfig, "API_TOKEN_HASH_SECRET">
): string => {
  const digest = createHmac("sha256", config.API_TOKEN_HASH_SECRET)
    .update(`${LISTING_VERIFY_PURPOSE}:${target.userId}:${target.host}:${target.port}`)
    .digest("hex");
  return `fs-verify-${digest.slice(0, 12).toUpperCase()}`;
};

export interface ListingOwnershipClaims {
  iss: string;
  sub: string;
  typ: typeof LISTING_OWNERSHIP_TYP;
  host: string;
  port: number;
  iat: number;
  exp: number;
}

/**
 * Issues a short-lived signed proof that a user has verified ownership of a
 * specific host:port. The create-listing endpoint requires this proof so that
 * verification cannot be skipped or replayed against a different listing.
 */
export const issueListingOwnershipProof = (
  target: ListingVerificationTarget,
  config: AppConfig
): { token: string; expiresIn: number } => {
  const now = Math.floor(Date.now() / 1000);
  const payload: ListingOwnershipClaims = {
    iss: config.API_JWT_ISSUER,
    sub: target.userId,
    typ: LISTING_OWNERSHIP_TYP,
    host: target.host,
    port: target.port,
    iat: now,
    exp: now + LISTING_OWNERSHIP_TTL_SECONDS,
  };

  return {
    token: encodeJwt(payload, config.API_JWT_SECRET),
    expiresIn: LISTING_OWNERSHIP_TTL_SECONDS,
  };
};

/** Validates and decodes a listing ownership proof, enforcing signature, type, and expiry. */
export const decodeListingOwnershipProof = (
  token: string,
  config: AppConfig
): ListingOwnershipClaims => {
  const payload = decodeJwt(token, config.API_JWT_SECRET);
  if (payload.typ !== LISTING_OWNERSHIP_TYP) {
    throw new TokenDecodeError("Unexpected token type.");
  }
  return payload as unknown as ListingOwnershipClaims;
};
