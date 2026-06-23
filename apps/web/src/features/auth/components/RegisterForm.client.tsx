"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import { usePasswordVisibility } from "@/features/auth/hooks/usePasswordVisibility";
import type { RegisterFormCopy } from "@/features/auth/types";
import { Turnstile } from "@marsidev/react-turnstile";
import AuthSubmitButton from "./AuthSubmitButton.client";
import {
  AUTH_ALTERNATE_LINK_CLASS,
  AUTH_FIELD_ERROR_CLASS,
  AUTH_ICON_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_PASSWORD_TOGGLE_CLASS,
  authInputClass,
} from "./auth-styles";

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
        <div className="space-y-2">
          <label className={AUTH_LABEL_CLASS} htmlFor="register-email">
            {copy.emailLabel}
          </label>
          <div className="relative">
            <Mail className={AUTH_ICON_CLASS} />
            <input
              id="register-email"
              name="email"
              type="email"
              required
              autoComplete="section-register email"
              inputMode="email"
              placeholder={copy.emailPlaceholder}
              className={authInputClass("px-10")}
            />
          </div>
          {fieldErrors.email ? <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label className={AUTH_LABEL_CLASS} htmlFor="register-username">
            {copy.usernameLabel}
          </label>
          <div className="relative">
            <User className={AUTH_ICON_CLASS} />
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
              className={authInputClass("px-10")}
            />
          </div>
          {fieldErrors.username ? (
            <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.username}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className={AUTH_LABEL_CLASS} htmlFor="register-password">
            {copy.passwordLabel}
          </label>
          <div className="relative">
            <Lock className={AUTH_ICON_CLASS} />
            <input
              id="register-password"
              name="password"
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              autoComplete="section-register new-password"
              placeholder={copy.passwordPlaceholder}
              className={authInputClass("px-10 pr-12")}
            />
            <button
              type="button"
              onClick={toggle}
              className={AUTH_PASSWORD_TOGGLE_CLASS}
              aria-label={showPasswords ? copy.hidePasswordAriaLabel : copy.showPasswordAriaLabel}
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.password}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className={AUTH_LABEL_CLASS} htmlFor="register-confirm-password">
            {copy.confirmPasswordLabel}
          </label>
          <div className="relative">
            <Lock className={AUTH_ICON_CLASS} />
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              autoComplete="section-register new-password"
              placeholder={copy.confirmPasswordPlaceholder}
              className={authInputClass("px-10")}
            />
          </div>
          {fieldErrors.confirmPassword ? (
            <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-card border border-border bg-bg-panel/60 p-4">
          <label
            htmlFor="register-terms-accepted"
            className="flex cursor-pointer items-start gap-3 font-body text-sm text-foreground"
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
            <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.termsAccepted}</p>
          ) : null}

          <label
            htmlFor="register-privacy-accepted"
            className="flex cursor-pointer items-start gap-3 font-body text-sm text-foreground"
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
            <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.privacyAccepted}</p>
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
          <div className="rounded-control border border-danger/40 bg-danger/10 px-4 py-3 font-ui text-base text-danger">
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

      <div className="mt-8 border-t border-border pt-6">
        <p className="font-body text-sm text-muted">
          {copy.alternatePrompt}{" "}
          <Link href={loginHref} className={AUTH_ALTERNATE_LINK_CLASS}>
            {copy.alternateCta}
          </Link>
        </p>
        <p className="mt-3 font-body text-xs text-muted/80">{copy.legalDisclaimer}</p>
      </div>
    </form>
  );
}
