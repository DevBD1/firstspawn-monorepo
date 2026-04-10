"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useRef } from "react";
import {
  COOKIE_CONSENT_EVENT,
  readStoredCookieConsent,
  type CookieConsentMode,
} from "@/lib/cookie-consent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    const initPostHog = () => {
      if (!posthogKey || hasInitializedRef.current || posthog.__loaded) {
        hasInitializedRef.current = hasInitializedRef.current || posthog.__loaded;
        return;
      }

      posthog.init(posthogKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        capture_pageview: false,
        capture_pageleave: true,
      });

      hasInitializedRef.current = true;
    };

    const applyConsent = (mode: CookieConsentMode) => {
      if (mode === "all") {
        initPostHog();
        if (hasInitializedRef.current) {
          posthog.opt_in_capturing();
        }
        return;
      }

      if (hasInitializedRef.current) {
        posthog.opt_out_capturing();
      }
    };

    const storedConsent = readStoredCookieConsent();
    if (storedConsent !== null) {
      applyConsent(storedConsent);
    }

    const handleConsentChange = (event: Event) => {
      const mode = (event as CustomEvent<CookieConsentMode>).detail;
      if (mode) {
        applyConsent(mode);
      }
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
