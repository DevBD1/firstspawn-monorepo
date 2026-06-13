"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle, Eye, EyeOff, Key, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { WLButton } from "@firstspawn/ui";
import DiscordIcon from "@/components/ui/DiscordIcon";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import { usePasswordVisibility } from "@/features/auth/hooks/usePasswordVisibility";
import type { LoginFormCopy } from "@/features/auth/types";
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

interface LoginFormProps {
  lang: string;
  nextPath?: string;
  showRegisteredBanner?: boolean;
  registeredMessage?: string;
  copy: LoginFormCopy;
}

export default function LoginForm({
  lang,
  nextPath,
  showRegisteredBanner,
  registeredMessage,
  copy,
}: LoginFormProps) {
  const [state, action] = useActionState(loginAction, AUTH_ACTION_INITIAL_STATE);
  const { isVisible: showPassword, toggle } = usePasswordVisibility();

  const fieldErrors = state?.fieldErrors ?? {};
  const message = state?.message ?? null;
  const registerHref = nextPath
    ? `/${lang}/signup?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/signup`;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath ?? undefined} />

      {showRegisteredBanner && registeredMessage ? (
        <div className="flex items-center gap-3 rounded-control border border-success/40 bg-success/10 px-4 py-3 font-ui text-base text-success">
          <CheckCircle className="h-5 w-5 shrink-0 text-success" />
          <span>{registeredMessage}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        <WLButton
          type="button"
          variant="primary"
          fullWidth
          style={{ background: "#5865F2", borderColor: "#4752C4", color: "#ffffff" }}
        >
          <DiscordIcon className="h-5 w-5" />
          {copy.discordCta}
        </WLButton>

        <WLButton type="button" variant="secondary" fullWidth>
          <Key className="h-4 w-4" />
          {copy.passkeyCta}
        </WLButton>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-bg-panel px-4 font-ui text-base uppercase text-muted">
              {copy.dividerLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className={AUTH_LABEL_CLASS} htmlFor="login-identifier">
              {copy.identifierLabel}
            </label>
            <div className="relative">
              <Mail className={AUTH_ICON_CLASS} />
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                required
                minLength={3}
                autoComplete="username"
                placeholder={copy.identifierPlaceholder}
                className={authInputClass("px-10")}
              />
            </div>
            {fieldErrors.identifier ? (
              <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.identifier}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className={AUTH_LABEL_CLASS} htmlFor="login-password">
              {copy.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                className={authInputClass("px-4 pr-12")}
              />
              <button
                type="button"
                onClick={toggle}
                className={AUTH_PASSWORD_TOGGLE_CLASS}
                aria-label={showPassword ? copy.hidePasswordAriaLabel : copy.showPasswordAriaLabel}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className={AUTH_FIELD_ERROR_CLASS}>{fieldErrors.password}</p>
            ) : null}
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
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="font-body text-sm text-muted">
          {copy.alternatePrompt}{" "}
          <Link href={registerHref} className={AUTH_ALTERNATE_LINK_CLASS}>
            {copy.alternateCta}
          </Link>
        </p>
      </div>
    </form>
  );
}
