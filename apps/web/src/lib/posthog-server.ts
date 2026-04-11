import { PostHog } from "posthog-node";
import { getPublicConfig } from "./config";

let posthogClient: PostHog | null = null;

export function getPostHogClient() {
  if (!posthogClient) {
    const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = getPublicConfig();
    if (!NEXT_PUBLIC_POSTHOG_KEY) return null;
    posthogClient = new PostHog(NEXT_PUBLIC_POSTHOG_KEY, {
      host: NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}
