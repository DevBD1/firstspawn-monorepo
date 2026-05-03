"use client";

import { useActionState } from "react";
import { CheckCircle, Eye, EyeOff, Key, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { PixelButton } from "@firstspawn/ui";
import DiscordIcon from "@/components/ui/DiscordIcon";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";
import { usePasswordVisibility } from "@/features/auth/hooks/usePasswordVisibility";
import type { LoginFormCopy } from "@/features/auth/types";
import { Turnstile } from "@marsidev/react-turnstile";
import AuthSubmitButton from "./AuthSubmitButton.client";

interface LoginFormProps {
  lang: string;
  nextPath?: string;
  showRegisteredBanner?: boolean;
  registeredMessage?: string;
  copy: LoginFormCopy;
}

/**
 * LoginForm - A functional terminal input module for user authentication.
 * Uses React 19's `useActionState` for seamless server action integration.
 */
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

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath ?? undefined} />

      {showRegisteredBanner && registeredMessage ? (
        <div className="flex items-center gap-3 border-2 border-success/50 bg-success/10 px-4 py-3 font-ui text-base text-success">
          <CheckCircle className="h-5 w-5 shrink-0 text-success" />
          <span>{registeredMessage}</span>
        </div>
      ) : null}

      <div className="space-y-4">
        <PixelButton
          type="button"
          variant="discord"
          className="flex w-full items-center justify-center gap-3"
        >
          <DiscordIcon className="h-5 w-5" />
          {copy.discordCta}
        </PixelButton>

        <PixelButton
          type="button"
          variant="secondary"
          className="flex w-full items-center justify-center gap-3"
        >
          <Key className="h-4 w-4" />
          {copy.passkeyCta}
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
              htmlFor="login-identifier"
            >
              {copy.identifierLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                required
                minLength={3}
                autoComplete="username"
                placeholder={copy.identifierPlaceholder}
                className="w-full border-2 border-black bg-bg-panel px-10 py-3 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {fieldErrors.identifier ? (
              <p className="font-ui text-base text-danger">{fieldErrors.identifier}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-foreground"
              htmlFor="login-password"
            >
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
                className="w-full border-2 border-black bg-bg-panel px-4 py-3 pr-12 font-ui text-xl leading-none text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-secondary text-foreground transition-colors hover:bg-secondary-hover"
                aria-label={showPassword ? copy.hidePasswordAriaLabel : copy.showPasswordAriaLabel}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="font-ui text-base text-danger">{fieldErrors.password}</p>
            ) : null}
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
    </form>
  );
}
