"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { PixelButton } from "@firstspawn/ui";
import DiscordIcon from "@/components/ui/DiscordIcon";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import { usePasswordVisibility } from "@/features/auth/hooks/usePasswordVisibility";
import type { RegisterFormCopy } from "@/features/auth/types";
import { Turnstile } from "@marsidev/react-turnstile";
import AuthSubmitButton from "./AuthSubmitButton.client";

interface RegisterFormProps {
  lang: string;
  nextPath?: string;
  copy: RegisterFormCopy;
}

export default function RegisterForm({ lang, nextPath, copy }: RegisterFormProps) {
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
      <input type="hidden" name="next" value={nextPath ?? undefined} />

      <div className="space-y-4">
        <PixelButton
          type="button"
          variant="discord"
          className="flex w-full items-center justify-center gap-3"
        >
          <DiscordIcon className="h-5 w-5" />
          {copy.discordCta}
        </PixelButton>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-muted/20" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 font-ui text-base uppercase text-muted">
              {copy.dividerLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-foreground"
              htmlFor="register-email"
            >
              {copy.emailLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="section-register email"
                inputMode="email"
                placeholder={copy.emailPlaceholder}
                className="w-full border-2 border-black bg-bg-panel px-10 py-3 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {fieldErrors.email ? (
              <p className="font-ui text-base text-danger">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-foreground"
              htmlFor="register-username"
            >
              {copy.usernameLabel}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="register-username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                autoComplete="section-register nickname"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={copy.usernamePlaceholder}
                className="w-full border-2 border-black bg-bg-panel px-10 py-3 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {fieldErrors.username ? (
              <p className="font-ui text-base text-danger">{fieldErrors.username}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-foreground"
              htmlFor="register-password"
            >
              {copy.passwordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="register-password"
                name="password"
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                autoComplete="section-register new-password"
                placeholder={copy.passwordPlaceholder}
                className="w-full border-2 border-black bg-bg-panel px-10 py-3 pr-12 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-secondary text-foreground transition-colors hover:bg-secondary-hover"
                aria-label={showPasswords ? copy.hidePasswordAriaLabel : copy.showPasswordAriaLabel}
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="font-ui text-base text-danger">{fieldErrors.password}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-foreground"
              htmlFor="register-confirm-password"
            >
              {copy.confirmPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showPasswords ? "text" : "password"}
                required
                minLength={8}
                autoComplete="section-register new-password"
                placeholder={copy.confirmPasswordPlaceholder}
                className="w-full border-2 border-black bg-bg-panel px-10 py-3 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {fieldErrors.confirmPassword ? (
              <p className="font-ui text-base text-danger">{fieldErrors.confirmPassword}</p>
            ) : null}
          </div>

          <div className="space-y-3 border-2 border-black bg-bg-panel/60 p-4">
            <label
              htmlFor="register-terms-accepted"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-foreground/80"
            >
              <input
                id="register-terms-accepted"
                name="termsAccepted"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                {copy.termsLabelPrefix}{" "}
                <Link
                  href={`/${lang}/terms`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
                >
                  {copy.termsLabelCta}
                </Link>
                .
              </span>
            </label>
            {fieldErrors.termsAccepted ? (
              <p className="font-ui text-base text-danger">{fieldErrors.termsAccepted}</p>
            ) : null}

            <label
              htmlFor="register-privacy-accepted"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-foreground/80"
            >
              <input
                id="register-privacy-accepted"
                name="privacyAccepted"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                {copy.privacyLabelPrefix}{" "}
                <Link
                  href={`/${lang}/privacy`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body font-semibold text-primary underline underline-offset-2 transition-colors hover:text-primary-hover"
                >
                  {copy.privacyLabelCta}
                </Link>
                .
              </span>
            </label>
            {fieldErrors.privacyAccepted ? (
              <p className="font-ui text-base text-danger">{fieldErrors.privacyAccepted}</p>
            ) : null}

            <label
              htmlFor="register-marketing-consent"
              className="flex cursor-pointer items-start gap-3 font-body text-sm text-muted"
            >
              <input
                id="register-marketing-consent"
                name="marketingConsent"
                type="checkbox"
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>{copy.marketingConsentLabel}</span>
            </label>
          </div>

          {message ? (
            <div className="border-2 border-danger/50 bg-danger/10 px-4 py-3 font-ui text-base text-danger">
              {message}
            </div>
          ) : null}

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                options={{ theme: "dark" }}
              />
            </div>
          ) : null}

          <AuthSubmitButton label={copy.submitLabel} pendingLabel={copy.submitPendingLabel} />
        </div>
      </div>

      <div className="mt-8 border-t-2 border-muted/10 pt-6">
        <p className="font-body text-sm text-muted">
          {copy.alternatePrompt}{" "}
          <Link
            href={loginHref}
            className="font-ui text-base font-bold uppercase tracking-wide text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-hover"
          >
            {copy.alternateCta}
          </Link>
        </p>
        <p className="mt-3 font-body text-xs text-muted/60">{copy.legalDisclaimer}</p>
      </div>
    </form>
  );
}
