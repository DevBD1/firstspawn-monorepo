import "server-only";

import { cookies } from "next/headers";
import { i18n, type Locale } from "./i18n-config";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, getApiBaseUrl } from "./auth-config";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, getApiBaseUrl };

export interface AuthCookieUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  username: string;
  locale: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthCookieUser | null;
}

interface Envelope<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

interface MeResponseData {
  user: unknown;
}

export const isSupportedLocale = (value: string): value is Locale => {
  return i18n.locales.includes(value as Locale);
};

const parseApiUser = (value: unknown): AuthCookieUser | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.email !== "string" ||
    typeof record.username !== "string" ||
    typeof record.locale !== "string"
  ) {
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    email_confirmed_at:
      record.email_confirmed_at && typeof record.email_confirmed_at === "string"
        ? record.email_confirmed_at
        : null,
    username: record.username,
    locale: record.locale,
  };
};

const getVerifiedUser = async (accessToken: string): Promise<AuthCookieUser | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as Envelope<MeResponseData>;
    return parseApiUser(json.data?.user);
  } catch {
    return null;
  }
};

export const getAuthState = async (): Promise<AuthState> => {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!refreshToken || !accessToken) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  const verifiedUser = await getVerifiedUser(accessToken);
  if (!verifiedUser) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    user: verifiedUser,
  };
};
