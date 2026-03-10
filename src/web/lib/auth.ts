import "server-only";

import { cookies } from "next/headers";
import { i18n, type Locale } from "./i18n-config";

export const ACCESS_TOKEN_COOKIE = "fs_access_token";
export const REFRESH_TOKEN_COOKIE = "fs_refresh_token";
export const USER_SESSION_COOKIE = "fs_user";

export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface AuthCookieUser {
  id: string;
  email: string;
  username: string;
  locale: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthCookieUser | null;
}

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8000/api/v1";
  return baseUrl.replace(/\/$/, "");
};

export const isSupportedLocale = (value: string): value is Locale => {
  return i18n.locales.includes(value as Locale);
};

const parseUserCookie = (rawValue: string | undefined): AuthCookieUser | null => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<AuthCookieUser>;
    if (
      typeof parsed.id !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.username !== "string" ||
      typeof parsed.locale !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      username: parsed.username,
      locale: parsed.locale,
    };
  } catch {
    return null;
  }
};

export const getAuthState = async (): Promise<AuthState> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    user: parseUserCookie(cookieStore.get(USER_SESSION_COOKIE)?.value),
  };
};
