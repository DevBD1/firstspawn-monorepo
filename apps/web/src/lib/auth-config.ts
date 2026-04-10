export const ACCESS_TOKEN_COOKIE = "fs_access_token";
export const REFRESH_TOKEN_COOKIE = "fs_refresh_token";
export const USER_SESSION_COOKIE = "fs_user";

export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8000/api/v1";
  return baseUrl.replace(/\/$/, "");
};

export const getApiBasicAuthHeader = (): string | null => {
  const user = process.env.API_BASIC_AUTH_USER || process.env.NGINX_AUTH_USER;
  const pass = process.env.API_BASIC_AUTH_PASS || process.env.NGINX_AUTH_PASS;

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
