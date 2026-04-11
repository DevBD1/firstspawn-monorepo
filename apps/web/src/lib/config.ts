import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-only config
// ---------------------------------------------------------------------------
// Validated once per process lifecycle via getWebConfig().
// Do NOT import this from client components ("use client").
// ---------------------------------------------------------------------------

const serverConfigSchema = z.object({
  // API proxy
  API_BASE_URL: z.string().url().default("http://localhost:8000/api/v1"),
  API_BASIC_AUTH_USER: z.string().optional(),
  API_BASIC_AUTH_PASS: z.string().optional(),
  // Nginx basic-auth aliases (fallback for API_BASIC_AUTH_*)
  NGINX_AUTH_USER: z.string().optional(),
  NGINX_AUTH_PASS: z.string().optional(),
  // Newsletter / JWT
  JWT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_AUDIENCE_ID: z.string().optional(),
  // AI captcha (all optional — degrades gracefully)
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  // Cloudflare Turnstile
  TURNSTILE_SECRET_KEY: z.string().optional(),
  // Vercel platform
  VERCEL_ENV: z.string().optional(),
  // Route gating
  LOCK_BETA_ROUTES: z.coerce.boolean().optional(),
});

export type WebServerConfig = z.infer<typeof serverConfigSchema>;

let cachedServerConfig: WebServerConfig | undefined;

/**
 * Returns the validated, cached server-side config for the web app.
 *
 * Call from Server Components, Server Actions, Route Handlers, and
 * `instrumentation.ts`. Never call from client components.
 */
export const getWebConfig = (): WebServerConfig => {
  if (!cachedServerConfig) {
    cachedServerConfig = serverConfigSchema.parse(process.env);
  }
  return cachedServerConfig;
};

// ---------------------------------------------------------------------------
// Public (NEXT_PUBLIC_*) config
// ---------------------------------------------------------------------------
// NEXT_PUBLIC_* vars are inlined at build time by Next.js. This schema
// validates them on the server side (build / startup). Client components must
// still read process.env.NEXT_PUBLIC_* directly — do not pass this object
// into client bundles.
// ---------------------------------------------------------------------------

const publicConfigSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://firstspawn.com"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
  NEXT_PUBLIC_LOCK_BETA_ROUTES: z.coerce.boolean().default(false),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

export type WebPublicConfig = z.infer<typeof publicConfigSchema>;

let cachedPublicConfig: WebPublicConfig | undefined;

/**
 * Returns the validated, cached public config.
 *
 * Safe to call from Server Components, layouts, sitemap, OG handlers, etc.
 * Client components must read `process.env.NEXT_PUBLIC_*` directly.
 */
export const getPublicConfig = (): WebPublicConfig => {
  if (!cachedPublicConfig) {
    cachedPublicConfig = publicConfigSchema.parse(process.env);
  }
  return cachedPublicConfig;
};

export const isBetaRouteLockEnabled = (): boolean => {
  const serverConfig = getWebConfig();

  if (typeof serverConfig.LOCK_BETA_ROUTES === "boolean") {
    return serverConfig.LOCK_BETA_ROUTES;
  }

  return getPublicConfig().NEXT_PUBLIC_LOCK_BETA_ROUTES;
};

/** Convenience re-export used by `resetConfigForTests` in unit tests. */
export const resetWebConfigForTests = (): void => {
  cachedServerConfig = undefined;
  cachedPublicConfig = undefined;
};
