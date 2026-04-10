"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import posthog from "posthog-js";
import type { Locale } from "@/lib/i18n-config";
import {
  readStoredCookieConsent,
  writeStoredCookieConsent,
  type CookieConsentMode,
} from "@/lib/cookie-consent";

export interface CookieConsentProps {
  lang: Locale;
  dictionary: {
    cookie_consent: {
      title: string;
      introPrefix: string;
      introLinkLabel: string;
      introSuffix: string;
      consentPrefix: string;
      privacyLinkLabel: string;
      consentMiddle: string;
      termsLinkLabel: string;
      consentSuffix: string;
      servicesLinkLabel: string;
      acceptAll: string;
      manageSettings: string;
      savePreferences: string;
      acceptSelected: string;
      essentialOnly: string;
      back: string;
      essentialTitle: string;
      essentialDescription: string;
      analyticsTitle: string;
      analyticsDescription: string;
      manageDescription: string;
      categoryNecessary: string;
      categoryStatistics: string;
      categoryPersonalization: string;
      categoryMarketing: string;
      categoryUnavailable: string;
      stateOn: string;
      stateOff: string;
    };
  };
}

const PANEL_BUTTON_CLASS =
  "inline-flex min-w-[8.25rem] items-center justify-center border-2 px-3 py-[0.3rem] font-ui text-[1.05rem] leading-none transition-transform duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:min-w-[8.75rem] sm:text-[1.15rem]";

export default function CookieConsent({ lang, dictionary }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isManagingSettings, setIsManagingSettings] = useState(false);
  const [statisticsEnabled, setStatisticsEnabled] = useState(true);

  const hrefs = useMemo(
    () => ({
      learnMore: `/${lang}/privacy`,
      privacy: `/${lang}/privacy`,
      terms: `/${lang}/terms`,
      services: `/${lang}/terms`,
    }),
    [lang]
  );

  useEffect(() => {
    const consent = readStoredCookieConsent();
    if (consent === null) {
      const timer = setTimeout(() => setIsVisible(true), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const persistConsent = (mode: CookieConsentMode) => {
    writeStoredCookieConsent(mode);

    if (mode === "all") {
      requestAnimationFrame(() => {
        posthog.capture("cookie_consent_updated", { mode });
      });
    }

    setIsVisible(false);
    setIsManagingSettings(false);
  };

  const handleAcceptAll = () => persistConsent("all");
  const handleSavePreferences = () => persistConsent(statisticsEnabled ? "all" : "essential");

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-brightness-[0.55]"
        >
          <div className="w-full max-w-[38rem] border border-[#ffd700] bg-[#0b131a] p-[3px] shadow-[0_0_0_1px_#0b0f10,8px_8px_0_0_rgba(0,0,0,0.55)]">
            <div className="border border-[#cc5500] bg-[#0f161c] px-4 pb-4 pt-3 text-center text-[#f4fbfb] shadow-[inset_0_0_0_1px_rgba(255,215,0,0.12)] sm:px-5 sm:pb-4 sm:pt-2">
              <div className="mx-auto -mt-6 mb-3 inline-flex border border-[#1a1a1a] bg-[#ffd700] px-3 py-[0.3rem] font-display text-[0.55rem] uppercase tracking-[0.08em] text-[#1a1a1a] shadow-[0_0_0_1px_#cc5500] sm:-mt-5 sm:text-[0.6rem]">
                {dictionary.cookie_consent.title}
              </div>

              {!isManagingSettings ? (
                <>
                  <div className="mx-auto max-w-[32rem] space-y-3.5 font-body text-[0.84rem] leading-[1.34] sm:max-w-[33.5rem] sm:px-1 sm:text-[0.92rem]">
                    <p>
                      {dictionary.cookie_consent.introPrefix}{" "}
                      <Link
                        href={hrefs.learnMore}
                        className="underline decoration-[#ffd700] underline-offset-4 hover:text-[#ffd700] hover:decoration-[#ffd700]"
                      >
                        {dictionary.cookie_consent.introLinkLabel}
                      </Link>{" "}
                      {dictionary.cookie_consent.introSuffix}
                    </p>
                    <p>
                      {dictionary.cookie_consent.consentPrefix}{" "}
                      <Link
                        href={hrefs.privacy}
                        className="underline decoration-[#ffd700] underline-offset-4 hover:text-[#ffd700] hover:decoration-[#ffd700]"
                      >
                        {dictionary.cookie_consent.privacyLinkLabel}
                      </Link>{" "}
                      {dictionary.cookie_consent.consentMiddle}{" "}
                      <Link
                        href={hrefs.terms}
                        className="underline decoration-[#ffd700] underline-offset-4 hover:text-[#ffd700] hover:decoration-[#ffd700]"
                      >
                        {dictionary.cookie_consent.termsLinkLabel}
                      </Link>{" "}
                      {dictionary.cookie_consent.consentSuffix}{" "}
                      <Link
                        href={hrefs.services}
                        className="underline decoration-[#ffd700] underline-offset-4 hover:text-[#ffd700] hover:decoration-[#ffd700]"
                      >
                        {dictionary.cookie_consent.servicesLinkLabel}
                      </Link>
                      .
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className={`${PANEL_BUTTON_CLASS} border-[#8b6c00] bg-[#c9a300] text-[#fff3bf] shadow-[4px_4px_0_0_#101214] hover:bg-[#dbb200]`}
                    >
                      {dictionary.cookie_consent.acceptAll}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsManagingSettings(true)}
                      className={`${PANEL_BUTTON_CLASS} border-[#0f1316] bg-[#111417] text-[#f2f6f7] shadow-[4px_4px_0_0_#050607] hover:bg-[#1b2126]`}
                    >
                      {dictionary.cookie_consent.manageSettings}
                    </button>
                  </div>
                </>
              ) : (
                <div className="mx-auto max-w-[32rem] space-y-4 text-center sm:max-w-[33.5rem]">
                  <p className="mx-auto max-w-[30rem] font-body text-[0.82rem] leading-[1.32] text-[#f5f1de] sm:text-[0.88rem]">
                    {dictionary.cookie_consent.manageDescription}
                  </p>

                  <div className="mx-auto grid max-w-[22rem] grid-cols-1 gap-x-8 gap-y-3 text-left sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <span className="relative h-4 w-8 rounded-full border border-black bg-[#0f1316] shadow-[3px_3px_0_0_#050607]">
                        <span className="absolute right-[1px] top-[1px] h-[12px] w-[12px] rounded-full bg-[#d6d9da]" />
                      </span>
                      <div>
                        <p className="font-ui text-[1rem] leading-none text-[#f5f1de]">
                          {dictionary.cookie_consent.categoryNecessary}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-3 opacity-65"
                      aria-disabled="true"
                    >
                      <span className="relative h-4 w-8 rounded-full border border-[#7b8c8f] bg-[#cfd3d4]">
                        <span className="absolute left-[1px] top-[1px] h-[12px] w-[12px] rounded-full bg-white" />
                      </span>
                      <div>
                        <p className="font-ui text-[1rem] leading-none text-[#f5f1de]">
                          {dictionary.cookie_consent.categoryPersonalization}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatisticsEnabled((current) => !current)}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={`relative h-4 w-8 rounded-full border ${
                          statisticsEnabled
                            ? "border-black bg-[#0f1316] shadow-[3px_3px_0_0_#050607]"
                            : "border-[#7b8c8f] bg-[#cfd3d4]"
                        }`}
                      >
                        <span
                          className={`absolute top-[1px] h-[12px] w-[12px] rounded-full bg-white ${
                            statisticsEnabled ? "right-[1px]" : "left-[1px]"
                          }`}
                        />
                      </span>
                      <div>
                        <p className="font-ui text-[1rem] leading-none text-[#f5f1de]">
                          {dictionary.cookie_consent.categoryStatistics}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex items-center gap-3 opacity-65"
                      aria-disabled="true"
                    >
                      <span className="relative h-4 w-8 rounded-full border border-[#7b8c8f] bg-[#cfd3d4]">
                        <span className="absolute left-[1px] top-[1px] h-[12px] w-[12px] rounded-full bg-white" />
                      </span>
                      <div>
                        <p className="font-ui text-[1rem] leading-none text-[#f5f1de]">
                          {dictionary.cookie_consent.categoryMarketing}
                        </p>
                      </div>
                    </button>
                  </div>

                  <p className="font-body text-[0.72rem] leading-[1.25] text-[#c7b88a]">
                    {dictionary.cookie_consent.categoryUnavailable}
                  </p>

                  <div className="flex flex-col items-center justify-center gap-2.5 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className={`${PANEL_BUTTON_CLASS} border-[#8b6c00] bg-[#c9a300] text-[#fff3bf] shadow-[4px_4px_0_0_#101214] hover:bg-[#dbb200]`}
                    >
                      {dictionary.cookie_consent.acceptAll}
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className={`${PANEL_BUTTON_CLASS} border-[#0f1316] bg-[#f0f3f4] text-[#101214] shadow-[4px_4px_0_0_#050607] hover:bg-white`}
                    >
                      {dictionary.cookie_consent.acceptSelected}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
