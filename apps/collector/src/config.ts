import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const appRoot = path.resolve(currentDir, "..");
const repoRoot = path.resolve(appRoot, "../..");

loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ path: path.join(appRoot, ".env"), override: false });

const configSchema = z.object({
  COLLECTOR_API_BASE_URL: z.string().url().default("http://localhost:8000/api/v1"),
  API_COLLECTOR_KEY: z.string().min(1).default("change-me"),
  COLLECTOR_INSTANCE_ID: z.string().trim().min(1).max(64),
  COLLECTOR_PROBE_INTERVAL_SECONDS: z.coerce
    .number()
    .int()
    .refine((value) => value === 600, "Probe interval must be 600 seconds.")
    .default(600),
  COLLECTOR_CONCURRENCY: z.coerce.number().int().positive().default(50),
  COLLECTOR_TARGET_PAGE_SIZE: z.coerce.number().int().min(1).max(500).default(500),
  COLLECTOR_PROBE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  COLLECTOR_HOST: z.string().default("0.0.0.0"),
  COLLECTOR_PORT: z.coerce.number().int().positive().default(8081),
});

export type CollectorConfig = z.infer<typeof configSchema>;

let cachedConfig: CollectorConfig | undefined;

export const getConfig = (): CollectorConfig => {
  if (!cachedConfig) {
    cachedConfig = configSchema.parse(process.env);
  }
  return cachedConfig;
};

export const resetConfigForTests = (): void => {
  cachedConfig = undefined;
};
