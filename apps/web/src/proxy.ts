import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  USER_SESSION_COOKIE,
  getApiBasicAuthHeader,
  getApiBaseUrl,
} from "./lib/auth-config";
import { isBetaRouteLockEnabled } from "./lib/config";

// --- RATE LIMIT CONFIGURATION (Merged from middleware.ts) ---
// Simple in-memory store for rate limiting (per-instance)
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_GENERAL = 200;
const MAX_REQUESTS_SENSITIVE = 10;
const SENSITIVE_PATHS = ["/newsletter", "/api/subscribe"];
const ACCESS_TOKEN_EXP_SKEW_SECONDS = 30;
const secureCookie = process.env.NODE_ENV === "production";

interface RefreshEnvelope {
  data: {
    tokens?: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
}

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function getLocale(request: NextRequest): string | undefined {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const locales = [...i18n.locales];
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

const shouldRefreshOnPath = (pathname: string): boolean => {
  return i18n.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
};

const decodeJwtPayload = (token: string): { exp?: number } | null => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
};

const isAccessTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }

  return payload.exp <= Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP_SKEW_SECONDS;
};

const refreshSession = async (refreshToken: string): Promise<RefreshedTokens | null> => {
  try {
    const basicAuth = getApiBasicAuthHeader();
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(basicAuth ? { Authorization: basicAuth } : {}),
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as RefreshEnvelope;
    const tokens = payload.data?.tokens;
    if (
      !tokens ||
      typeof tokens.access_token !== "string" ||
      typeof tokens.refresh_token !== "string" ||
      typeof tokens.expires_in !== "number"
    ) {
      return null;
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    };
  } catch {
    return null;
  }
};

const clearAuthCookies = (response: NextResponse): void => {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  response.cookies.delete(USER_SESSION_COOKIE);
};

const getPathLocale = (pathname: string): string | null => {
  for (const locale of i18n.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }

  return null;
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "127.0.0.1";

  // 1. RATE LIMITING LOGIC
  // -------------------------------------------------------------------------
  const now = Date.now();
  let limitInfo = rateLimit.get(ip);

  if (!limitInfo || now - limitInfo.lastReset > RATE_LIMIT_WINDOW) {
    limitInfo = { count: 0, lastReset: now };
    rateLimit.set(ip, limitInfo);
  }

  limitInfo.count++;

  const isSensitive = SENSITIVE_PATHS.some((p) => pathname.startsWith(p));
  const limit = isSensitive ? MAX_REQUESTS_SENSITIVE : MAX_REQUESTS_GENERAL;

  if (limitInfo.count > limit) {
    return new NextResponse(
      JSON.stringify({
        error: "Too many requests",
        message: "You have exceeded the rate limit. Please try again later.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const shouldAttemptRefresh =
    shouldRefreshOnPath(pathname) &&
    typeof refreshToken === "string" &&
    (!accessToken || isAccessTokenExpired(accessToken));

  let refreshedTokens: RefreshedTokens | null = null;
  let shouldClearSession = false;

  if (shouldAttemptRefresh && refreshToken) {
    refreshedTokens = await refreshSession(refreshToken);

    if (refreshedTokens) {
      request.cookies.set(ACCESS_TOKEN_COOKIE, refreshedTokens.accessToken);
      request.cookies.set(REFRESH_TOKEN_COOKIE, refreshedTokens.refreshToken);
      request.cookies.delete(USER_SESSION_COOKIE);
    } else {
      request.cookies.delete(ACCESS_TOKEN_COOKIE);
      request.cookies.delete(REFRESH_TOKEN_COOKIE);
      request.cookies.delete(USER_SESSION_COOKIE);
      shouldClearSession = true;
    }
  }

  // 2. ROUTING & I18N LOGIC
  // -------------------------------------------------------------------------
  const lockedPaths = ["/discover", "/signup", "/login", "/server"];
  const isLockedPath = lockedPaths.some((p) => pathname.includes(p));

  if (isBetaRouteLockEnabled() && isLockedPath) {
    const locale = getPathLocale(pathname) ?? getLocale(request) ?? i18n.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url), 302);
  }

  let response: NextResponse;

  // Skip i18n redirects for API, Assets, Admin, or existing locales
  const shouldSkipI18n =
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    i18n.locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);

  if (shouldSkipI18n) {
    response = NextResponse.next();
  } else {
    // Redirect if there is no locale
    const locale = getLocale(request);
    response = NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url),
      308
    );
  }

  if (refreshedTokens) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshedTokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      maxAge: refreshedTokens.expiresIn,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshedTokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
    response.cookies.delete(USER_SESSION_COOKIE);
  } else if (shouldClearSession) {
    clearAuthCookies(response);
  }

  // 3. SECURITY HEADERS
  // -------------------------------------------------------------------------
  response.headers.set("X-Frame-Options", "DENY");

  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return response;
}

export const config = {
  // Matcher: match everything EXCEPT static files and images.
  // Matcher: match everything EXCEPT static files, images, and SEO files.
  // We removed 'api' from exclusion to protect it with rate limiting.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|llms.txt|sitemap.xml).*)"],
};
