"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import PixelButton from "@/components/ui/PixelButton";
import DiscordIcon from "@/components/ui/DiscordIcon";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import { usePasswordVisibility } from "@/features/auth/hooks/usePasswordVisibility";
import type { SignupFormCopy } from "@/features/auth/types";
import AuthSubmitButton from "./AuthSubmitButton.client";

interface SignupFormProps {
  lang: string;
  nextPath?: string;
  copy: SignupFormCopy;
}

export default function SignupForm({ lang, nextPath, copy }: SignupFormProps) {
  const [state, action] = useActionState(registerAction, AUTH_ACTION_INITIAL_STATE);
  const { isVisible: showPasswords, toggle } = usePasswordVisibility();

  const fieldErrors = state?.fieldErrors ?? {};
  const message = state?.message ?? null;
  const loginHref = nextPath
    ? `/${lang}/login?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/login`;

  return (
    <form action={action} className="space-y-4" autoComplete="on">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath || ""} />

      <div className="space-y-4">
        <PixelButton type="button" variant="discord" className="flex w-full items-center justify-center gap-3">
          <DiscordIcon className="h-5 w-5" />
          {copy.discordCta}
        </PixelButton>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-zinc-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-zinc-950 px-4 font-ui text-base uppercase text-zinc-500">
              {copy.dividerLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-zinc-300"
              htmlFor="signup-email"
            >
              {copy.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="section-signup email"
                inputMode="email"
                placeholder={copy.emailPlaceholder}
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-10 py-3 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {fieldErrors.email ? <p className="font-ui text-base text-red-400">{fieldErrors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-zinc-300"
              htmlFor="signup-username"
            >
              {copy.usernameLabel}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                autoComplete="section-signup nickname"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={copy.usernamePlaceholder}
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-10 py-3 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {fieldErrors.username ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.username}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-zinc-300"
              htmlFor="signup-password"
            >
              {copy.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-password"
                name="password"
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                autoComplete="section-signup new-password"
                placeholder={copy.passwordPlaceholder}
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-10 py-3 pr-12 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-zinc-700 bg-zinc-800 text-zinc-100 transition-colors hover:bg-zinc-700"
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-zinc-300"
              htmlFor="signup-confirm-password"
            >
              {copy.confirmPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                autoComplete="section-signup new-password"
                placeholder={copy.confirmPasswordPlaceholder}
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-10 py-3 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <div className="space-y-3 border-2 border-zinc-800 bg-zinc-900/60 p-4">
            <label
              htmlFor="signup-terms-accepted"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-zinc-200"
            >
              <input
                id="signup-terms-accepted"
                name="termsAccepted"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
              />
              <span>
                {copy.termsLabelPrefix}{" "}
                <Link
                  href={`/${lang}/terms`}
                  className="font-body font-semibold text-emerald-500 underline underline-offset-2 transition-colors hover:text-emerald-400"
                >
                  {copy.termsLabelCta}
                </Link>
                .
              </span>
            </label>
            {fieldErrors.termsAccepted ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.termsAccepted}</p>
            ) : null}

            <label
              htmlFor="signup-privacy-accepted"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-zinc-200"
            >
              <input
                id="signup-privacy-accepted"
                name="privacyAccepted"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
              />
              <span>
                {copy.privacyLabelPrefix}{" "}
                <Link
                  href={`/${lang}/privacy`}
                  className="font-body font-semibold text-emerald-500 underline underline-offset-2 transition-colors hover:text-emerald-400"
                >
                  {copy.privacyLabelCta}
                </Link>
                .
              </span>
            </label>
            {fieldErrors.privacyAccepted ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.privacyAccepted}</p>
            ) : null}

            <label
              htmlFor="signup-marketing-consent"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-zinc-300"
            >
              <input
                id="signup-marketing-consent"
                name="marketingConsent"
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-500"
              />
              <span>{copy.marketingConsentLabel}</span>
            </label>
          </div>

          {message ? (
            <div className="border-2 border-red-800 bg-red-950/50 px-4 py-3 font-ui text-base text-red-300">
              {message}
            </div>
          ) : null}

          <AuthSubmitButton label={copy.submitLabel} pendingLabel={copy.submitPendingLabel} />
        </div>
      </div>

      <div className="mt-8 border-t-2 border-zinc-800/50 pt-6">
        <p className="font-body text-sm text-zinc-500">
          {copy.alternatePrompt}{" "}
          <Link
            href={loginHref}
            className="font-ui text-base font-bold uppercase tracking-wide text-emerald-500 underline decoration-emerald-500/30 underline-offset-4 transition-colors hover:text-emerald-400"
          >
            {copy.alternateCta}
          </Link>
        </p>
        <p className="mt-3 font-body text-xs text-zinc-600">{copy.legalDisclaimer}</p>
      </div>
    </form>
  );
}
