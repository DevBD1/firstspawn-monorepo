# Features

This document tracks the implementation status of features across the FirstSpawn project (Web, API, Mobile, Shared Packages).

## Completed / Implemented

### 1. Multi-language Support (i18n)
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   Supported Locales: English (`en`), Turkish (`tr`), German (`de`), Russian (`ru`), Spanish (`es`), French (`fr`).
    *   Default Locale: `en`.
    *   Implementation: Dictionary-based internationalization.
*   **Development Notes**:
    *   Configuration located in `lib/i18n-config.ts`.
    *   Dictionaries stored in `lib/dictionaries/*.json`.
    *   `get-dictionary.ts` handles loading locale data.
*   **Test & Result Notes**:
    *   Verify content switching by changing URL path prefixes (e.g., `/tr`, `/de`).
    *   Check `LocaleSwitcher` component functionality.

### 2. Custom "Screw Mechanic" Captcha
*   **Status**: ✅ Implemented
*   **Scope**: Web (Newsletter)
*   **Details**:
    *   A gamified CAPTCHA where users must align a screw/nut to a specific rotation.
    *   Includes "witty" server-side verification messages based on accuracy.
    *   Visuals: Pixel-art style with retro overlays.
*   **Development Notes**:
    *   Component: `components/captcha/NewsletterCaptcha.tsx`.
    *   Logic: `ScrewMechanic.tsx` handles the visual rotation.
    *   Server Action: `app/actions/captcha.ts` verifies the "humanity" with tolerance checks.
    *   Analytics: Tracks `captcha_opened`, `verification_attempted`, `failed`, `succeeded`, and `reset` in PostHog.
*   **Test & Result Notes**:
    *   Verify the rotation slider works.
    *   Ensure "Verify" button is disabled during animation/analysis.
    *   Check PostHog events are firing correctly on interactions.

### 3. Newsletter Subscription System
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   Email subscription with Double Opt-In (Verification Link).
    *   Providers: Resend (Email sending).
    *   Security: JWT-based token generation for verification links.
*   **Development Notes**:
    *   Action: `app/actions/newsletter.ts`.
    *   Validation: Uses `zod` for email format validation.
    *   Email Template: `components/emails/ConfirmationEmail.tsx` (React Email).
    *   API Route: `app/api/newsletter/confirm/route.ts` handles the token verification.
*   **Test & Result Notes**:
    *   Submit a valid email -> Check if confirmation email is received.
    *   Click confirmation link -> Verify subscription is marked active (mocked/logged currently if DB not connected).
    *   Submit invalid email -> Check error handling.

### 4. Analytics & Telemetry (PostHog)
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   Integration with PostHog for user behavior tracking.
    *   Privacy-focused: `capture_pageview: false` (manual control), `capture_pageleave: true`.
*   **Development Notes**:
    *   Provider: `components/providers/PostHogProvider.tsx`.
    *   Server-side client: `lib/posthog-server.ts`.
    *   Environment Variables: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
*   **Test & Result Notes**:
    *   Verify events appear in the PostHog dashboard.

### 5. Cookie Consent Banner
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   Pixel-art styled consent banner.
    *   Persists user choice in `localStorage`.
*   **Development Notes**:
    *   Component: `components/layout/CookieConsent.tsx`.
    *   Animations: Uses `framer-motion` for entry/exit.
    *   Logic: Checks `cookie_consent` key in local storage.
*   **Test & Result Notes**:
    *   Clear local storage -> Banner should appear after 1s delay.
    *   Accept/Decline -> Banner disappears, choice saved.

### 6. LLM / AI Context (`llms.txt`)
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   Standardized `llms.txt` file at root for AI scrapers/agents.
    *   Provides project overview and links to core resources.
*   **Development Notes**:
    *   Located at `public/llms.txt`.
*   **Test & Result Notes**:
    *   Access `/llms.txt` via browser to confirm visibility.

### 7. Security & Proxy
*   **Status**: ✅ Implemented
*   **Scope**: Web
*   **Details**:
    *   **Rate Limiting**: In-memory limiter with distinction between General paths (200 req/15min) and Sensitive paths (10 req/15min).
    *   **Security Headers**: Sets `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.
    *   **Routing**: Handles i18n path rewriting (e.g., `/about` -> `/en/about`).
*   **Development Notes**:
    *   Located in `proxy.ts` (Standard Next.js 16+ convention replaces `middleware.ts` with `proxy.ts`).
*   **Test & Result Notes**:
    *   Spam sensitive endpoints to verify 429 Too Many Requests.
    *   Check response headers for security directives.

## In Progress / Partial

### 8. Shared UI Package (`@firstspawn/ui`)
*   **Status**: 🚧 Started
*   **Scope**: Packages
*   **Details**:
    *   Basic scaffolding for a shared UI library.
    *   Currently contains a `Button` component.
*   **Development Notes**:
    *   Located in `packages/ui`.
    *   Needs expansion to include more atomic components (inputs, cards, etc.).

## Planned / Placeholder

### 9. Mobile Application (`@firstspawn/mobile`)
*   **Status**: 📅 Planned
*   **Scope**: Mobile
*   **Details**:
    *   React Native / Expo project structure initialized.
    *   Currently a placeholder with no active features.

### 10. Backend API (`@firstspawn/api`)
*   **Status**: 📅 Planned
*   **Scope**: API
*   **Details**:
    *   Server project structure initialized.
    *   Placeholder `index.ts`.
    *   Intended to serve as the central backend for Web and Mobile.
