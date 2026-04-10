import posthog from "posthog-js";

if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2025-05-24",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  });
}
