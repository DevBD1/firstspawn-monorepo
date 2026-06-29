"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  USER_SESSION_COOKIE,
  getApiBasicAuthHeader,
  getApiBaseUrl,
} from "@/lib/auth-config";
import { isSupportedLocale } from "@/lib/auth";
import type { AuthActionState, AuthFieldErrors } from "@/lib/auth-action-state";
import { getWebConfig } from "@/lib/config";

interface EnvelopeError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface Envelope<T> {
  data: T | null;
  error: EnvelopeError | null;
}

interface AuthApiUser {
  id: string;
  email: string;
  username: string;
  locale: string;
}

interface AuthTokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthApiResponseData {
  user: AuthApiUser;
  tokens: AuthTokenPair;
}

const secureCookie = process.env.NODE_ENV === "production";

const registerSchema = z.object({
  lang: z.string().default("en"),
  next: z.string().optional(),
  email: z.string().email("Please enter a valid email."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(32, "Username must be at most 32 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
  confirmPassword: z.string().min(8, "Please confirm your password."),
  termsAccepted: z
    .string()
    .default("")
    .refine((value) => value === "on", "You must accept the Terms of Service."),
  privacyAccepted: z
    .string()
    .default("")
    .refine((value) => value === "on", "You must accept the Privacy Policy."),
  marketingConsent: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

const loginSchema = z.object({
  lang: z.string().default("en"),
  next: z.string().optional(),
  identifier: z.string().min(3, "Use your email or username.").max(255, "Identifier is too long."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be at most 128 characters."),
});

const RAW_FORM_FIELDS = new Set(["password", "confirmPassword"]);

const toFormObject = (formData: FormData): Record<string, string> => {
  const entries = Object.fromEntries(formData.entries());
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(entries)) {
    if (typeof value !== "string") {
      normalized[key] = "";
      continue;
    }

    normalized[key] = RAW_FORM_FIELDS.has(key) ? value : value.trim();
  }

  return normalized;
};

const mapZodErrors = (
  issues: z.ZodIssue[]
): {
  message: string;
  fieldErrors: AuthFieldErrors;
} => {
  const fieldErrors: AuthFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") {
      continue;
    }

    if (!(field in fieldErrors)) {
      fieldErrors[field as keyof AuthFieldErrors] = issue.message;
    }
  }

  return {
    message: "Please fix the highlighted fields.",
    fieldErrors,
  };
};

const normalizeRedirectPath = (
  lang: string,
  nextPath: string | undefined,
  fallback: string
): string => {
  if (!nextPath || !nextPath.startsWith("/")) {
    return `/${lang}${fallback}`;
  }

  if (nextPath === "/") {
    return `/${lang}`;
  }

  if (nextPath.startsWith(`/${lang}`)) {
    return nextPath;
  }

  // The admin console is a real top-level route outside the localized tree, so
  // honor it as a return target (e.g. login redirect from the /admin gate).
  if (nextPath === "/admin" || nextPath.startsWith("/admin/")) {
    return nextPath;
  }

  return `/${lang}${fallback}`;
};

const setSessionCookies = async (payload: AuthApiResponseData): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, payload.tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: payload.tokens.expires_in,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, payload.tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
  cookieStore.delete(USER_SESSION_COOKIE);
};

const clearSessionCookies = async (): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(USER_SESSION_COOKIE);
};

const callAuthApi = async <T>(path: string, init: RequestInit): Promise<Envelope<T>> => {
  try {
    const url = new URL(`${getApiBaseUrl()}${path}`);
    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");

    const basicAuth = getApiBasicAuthHeader();
    if (basicAuth) {
      headers.set("Authorization", basicAuth);
    }

    const response = await fetch(url.toString(), {
      ...init,
      headers,
      cache: "no-store",
    });

    const json = (await response.json()) as Envelope<T>;

    if (!response.ok) {
      console.error("Auth API HTTP error status:", response.status, "body:", json);
      return {
        data: null,
        error: json.error || {
          code: "AUTH_REQUEST_FAILED",
          message: "Authentication request failed.",
        },
      };
    }

    return json;
  } catch (err) {
    console.error("[callAuthApi] FATAL FETCH ERROR:", err);
    return {
      data: null,
      error: {
        code: "AUTH_API_UNREACHABLE",
        message: "Authentication service is currently unavailable.",
      },
    };
  }
};

const mapApiError = (error: EnvelopeError): AuthActionState => {
  const fieldErrors: AuthFieldErrors = {};
  const details = error.details || {};
  const fieldName = typeof details.field === "string" ? details.field : null;
  const validFields = new Set<keyof AuthFieldErrors>([
    "email",
    "username",
    "identifier",
    "password",
    "confirmPassword",
    "termsAccepted",
    "privacyAccepted",
  ]);

  if (fieldName && validFields.has(fieldName as keyof AuthFieldErrors)) {
    fieldErrors[fieldName as keyof AuthFieldErrors] = error.message;
  }

  return {
    message: error.message,
    fieldErrors,
  };
};

interface TurnstileResponse {
  success: boolean;
  "error-codes": string[];
  challenge_ts?: string;
  hostname?: string;
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const { TURNSTILE_SECRET_KEY: secret } = getWebConfig();
  if (!secret) return true; // Bypass if not configured
  if (!token) return false;

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = (await response.json()) as TurnstileResponse;
    return data.success;
  } catch (error) {
    console.error("Turnstile validation error:", error);
    return false;
  }
}

export async function registerAction(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    return mapZodErrors(parsed.error.issues);
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return {
      message: "Passwords do not match.",
      fieldErrors: {
        confirmPassword: "Please make sure both passwords are the same.",
      },
    };
  }

  const turnstileToken = formData.get("cf-turnstile-response")?.toString() || "";
  const isHuman = await verifyTurnstileToken(turnstileToken);

  if (!isHuman) {
    return {
      message: "Security check failed. Please try again.",
      fieldErrors: {},
    };
  }

  const lang = isSupportedLocale(parsed.data.lang) ? parsed.data.lang : "en";

  const response = await callAuthApi<AuthApiResponseData>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
      locale: lang,
      terms_accepted: parsed.data.termsAccepted === "on",
      privacy_accepted: parsed.data.privacyAccepted === "on",
      marketing_consent: parsed.data.marketingConsent,
    }),
  });

  if (response.error || !response.data) {
    return mapApiError(
      response.error || {
        code: "AUTH_REGISTER_FAILED",
        message: "Could not create your account.",
      }
    );
  }

  const activationPath = `/${lang}/activation?email=${encodeURIComponent(parsed.data.email)}`;
  redirect(activationPath);
}

export async function loginAction(
  _previous: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(toFormObject(formData));
  if (!parsed.success) {
    return mapZodErrors(parsed.error.issues);
  }

  const turnstileToken = formData.get("cf-turnstile-response")?.toString() || "";
  const isHuman = await verifyTurnstileToken(turnstileToken);

  if (!isHuman) {
    return {
      message: "Security check failed. Please try again.",
      fieldErrors: {},
    };
  }

  const lang = isSupportedLocale(parsed.data.lang) ? parsed.data.lang : "en";

  const response = await callAuthApi<AuthApiResponseData>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier: parsed.data.identifier,
      password: parsed.data.password,
    }),
  });

  if (response.error || !response.data) {
    return mapApiError(
      response.error || {
        code: "AUTH_LOGIN_FAILED",
        message: "Could not sign you in.",
      }
    );
  }

  await setSessionCookies(response.data);

  redirect(normalizeRedirectPath(lang, parsed.data.next, "/console"));
}

const logoutSchema = z.object({
  lang: z.string().default("en"),
});

export async function logoutAction(formData: FormData): Promise<void> {
  const parsed = logoutSchema.safeParse(toFormObject(formData));
  const lang = parsed.success && isSupportedLocale(parsed.data.lang) ? parsed.data.lang : "en";

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await callAuthApi("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  await clearSessionCookies();
  redirect(`/${lang}`);
}
