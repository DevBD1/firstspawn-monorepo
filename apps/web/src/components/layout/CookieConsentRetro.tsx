"use client";

import React, { useState, useEffect } from "react";

/**
 * CookieConsentRetro Component
 *
 * A high-fidelity clone of the Flowstep cookie consent experience,
 * adapted for an 8-bit/pixel-art aesthetic as per DESIGN.md.
 *
 * DESIGN NOTES:
 * - Font-Display: Press Start 2P (Headlines/Buttons)
 * - Font-UI: VT323 (Labels/Descriptions)
 * - Snappy animations (duration-75/150)
 * - Square borders and solid drop shadows
 */
export default function CookieConsentRetro() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<"banner" | "sidebar" | "hidden">("hidden");
  const [consent, setConsent] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const savedConsent = localStorage.getItem("retro-cookie-consent");
    if (!savedConsent) {
      // Trigger snappy slide-in
      setTimeout(() => {
        setView("banner");
        setIsVisible(true);
      }, 500);
    }
  }, []);

  const savePreferences = (analytics: boolean, marketing: boolean) => {
    const data = {
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("retro-cookie-consent", JSON.stringify(data));
    setIsVisible(false);
    setTimeout(() => setView("hidden"), 500);
  };

  const handleAcceptAll = () => savePreferences(true, true);
  const handleRejectAll = () => savePreferences(false, false);
  const handleSave = () => savePreferences(consent.analytics, consent.marketing);

  if (view === "hidden") return null;

  return (
    <>
      {/* Backdrop: Snappy fade-in */}
      <div
        className={`fixed inset-0 z-[998] transition-opacity duration-150 ${view === "sidebar" ? "bg-black/40 opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setView("banner")}
      />

      {/* Cookie Banner (Bottom Right Card) */}
      {view === "banner" && (
        <div
          className={`fixed bottom-8 right-8 z-[1000] w-[400px] border-4 border-black bg-panel p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] transition-transform duration-150 ease-out flex flex-col gap-4 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"}`}
        >
          {/* Inset Accent Corner (Cyan Square) */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-fs-diamond" />

          <h2 className="font-display text-[12px] uppercase tracking-wider text-fs-diamond animate-pulse">
            Cookies Detected!
          </h2>

          <p className="font-ui text-lg text-foreground leading-tight">
            WE USE COOKIES TO ENHANCE YOUR EXPERIENCE. ANALYZE USAGE AND FOR ARCADE-LEVEL MARKETING.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleAcceptAll}
              className="font-display text-[10px] uppercase bg-primary text-black py-3 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Accept All
            </button>
            <button
              onClick={() => setView("sidebar")}
              className="font-display text-[10px] uppercase bg-secondary text-foreground py-3 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      )}

      {/* Preferences Sidebar (Full Height Right) */}
      {view === "sidebar" && (
        <div
          className={`fixed inset-y-0 right-0 z-[1000] w-full max-w-md border-l-8 border-black bg-background p-8 shadow-[-16px_0_0_rgba(0,0,0,0.5)] transition-transform duration-150 ease-out flex flex-col gap-8 ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-between items-start">
            <h2 className="font-display text-xl text-fs-gold uppercase leading-tight">
              Manage
              <br />
              Consent
            </h2>
            <button
              onClick={() => setView("banner")}
              className="font-display text-lg text-danger hover:text-danger-hover"
            >
              [X]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 flex flex-col gap-8">
            <div className="font-ui text-xl text-foreground/80 lowercase">
              Adjust your settings for optimal productivity and arcade immersion.
            </div>

            {/* Category: Necessary */}
            <div className="border-b-4 border-black pb-6 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-[10px] uppercase text-fs-diamond">
                  Strictly Essential
                </h3>
                <div className="w-12 h-6 bg-success border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] opacity-50 cursor-not-allowed" />
              </div>
              <p className="font-ui text-lg text-foreground/60 leading-none">
                REQUIRED FOR CORE SYSTEMS. NON-NEGOTIABLE.
              </p>
            </div>

            {/* Category: Analytics */}
            <div className="border-b-4 border-black pb-6 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-[10px] uppercase text-fs-gold">Analytics Pack</h3>
                <button
                  onClick={() => setConsent((prev) => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center p-1 ${consent.analytics ? "bg-success" : "bg-secondary"}`}
                >
                  <div
                    className={`w-3 h-3 bg-white border-2 border-black transition-transform ${consent.analytics ? "translate-x-[20px]" : ""}`}
                  />
                </button>
              </div>
              <p className="font-ui text-lg text-foreground/60 leading-none">
                MONITOR DATA FLOWS AND PERFORMANCE BOTTLENECKS.
              </p>
            </div>

            {/* Category: Marketing */}
            <div className="border-b-4 border-black pb-6 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-[10px] uppercase text-fs-orange">
                  Marketing Feed
                </h3>
                <button
                  onClick={() => setConsent((prev) => ({ ...prev, marketing: !prev.marketing }))}
                  className={`w-12 h-6 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center p-1 ${consent.marketing ? "bg-success" : "bg-secondary"}`}
                >
                  <div
                    className={`w-3 h-3 bg-white border-2 border-black transition-transform ${consent.marketing ? "translate-x-[20px]" : ""}`}
                  />
                </button>
              </div>
              <p className="font-ui text-lg text-foreground/60 leading-none">
                TAILORED ANNOUNCEMENTS AND PROMOTIONAL ARCADE FEEDS.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleSave}
              className="font-display text-[12px] uppercase bg-success text-black py-4 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-success-hover"
            >
              Save Settings
            </button>
            <button
              onClick={handleRejectAll}
              className="font-display text-[12px] uppercase bg-danger text-black py-4 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all hover:bg-danger-hover"
            >
              Decline Non-Essential
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * TAILWIND CONFIG PRESET (for user reference)
 *
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: {
 *         background: 'var(--background)',
 *         foreground: 'var(--foreground)',
 *         primary: 'var(--primary)',
 *         secondary: 'var(--secondary)',
 *         success: 'var(--success)',
 *         danger: 'var(--danger)',
 *         panel: 'var(--panel)',
 *         'fs-diamond': 'var(--fs-diamond)',
 *         'fs-gold': 'var(--fs-gold)',
 *         'fs-orange': 'var(--fs-orange)',
 *       },
 *       fontFamily: {
 *         display: ['"Press Start 2P"', 'cursive'],
 *         ui: ['VT323', 'monospace'],
 *         body: ['"JetBrains Mono"', 'monospace'],
 *       },
 *     },
 *   },
 * }
 */
