import { getWebConfig } from "./config";

export const ACCESS_TOKEN_COOKIE = "fs_access_token";
export const REFRESH_TOKEN_COOKIE = "fs_refresh_token";
export const USER_SESSION_COOKIE = "fs_user";

export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const getApiBaseUrl = (): string => {
  return getWebConfig().API_BASE_URL.replace(/\/$/, "");
};

export const getApiBasicAuthHeader = (): string | null => {
  const cfg = getWebConfig();
  const user = cfg.API_BASIC_AUTH_USER ?? cfg.NGINX_AUTH_USER;
  const pass = cfg.API_BASIC_AUTH_PASS ?? cfg.NGINX_AUTH_PASS;

  if (!user || !pass) {
    return null;
  }

  const raw = `${user}:${pass}`;
  const auth =
    typeof btoa === "function"
      ? btoa(raw)
      : typeof Buffer !== "undefined"
        ? Buffer.from(raw).toString("base64")
        : null;
  if (!auth) {
    return null;
  }

  return `Basic ${auth}`;
};
