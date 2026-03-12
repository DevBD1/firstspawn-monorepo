export const ACCESS_TOKEN_COOKIE = "fs_access_token";
export const REFRESH_TOKEN_COOKIE = "fs_refresh_token";
export const USER_SESSION_COOKIE = "fs_user";

export const REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8000/api/v1";
  return baseUrl.replace(/\/$/, "");
};
