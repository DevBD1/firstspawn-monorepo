"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle, Eye, EyeOff, Key, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import PixelButton from "@/components/ui/PixelButton";
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
    ? `/${lang}/register?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/register`;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath || ""} />

      {showRegisteredBanner && registeredMessage ? (
        <div className="flex items-center gap-3 border-2 border-emerald-700 bg-emerald-950/50 px-4 py-3 font-ui text-base text-emerald-300">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
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
          variant="authSecondary"
          className="flex w-full items-center justify-center gap-3"
        >
          <Key className="h-4 w-4" />
          {copy.passkeyCta}
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
              htmlFor="login-identifier"
            >
              {copy.identifierLabel}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                required
                minLength={3}
                autoComplete="username"
                placeholder={copy.identifierPlaceholder}
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-10 py-3 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {fieldErrors.identifier ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.identifier}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="block font-ui text-lg font-bold uppercase tracking-wide text-zinc-300"
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
                className="w-full border-2 border-zinc-800 bg-zinc-900 px-4 py-3 pr-12 font-ui text-xl leading-none text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={toggle}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-zinc-700 bg-zinc-800 text-zinc-100 transition-colors hover:bg-zinc-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p className="font-ui text-base text-red-400">{fieldErrors.password}</p>
            ) : null}
          </div>

          {message ? (
            <div className="border-2 border-red-800 bg-red-950/50 px-4 py-3 font-ui text-base text-red-300">
              {message}
            </div>
          ) : null}

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <div className="flex justify-center">
              <Turnstile siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} options={{ theme: "dark" }} />
            </div>
          ) : null}

          <AuthSubmitButton label={copy.submitLabel} pendingLabel={copy.submitPendingLabel} />
        </div>
      </div>

      <div className="mt-8 border-t-2 border-zinc-800/50 pt-6">
        <p className="font-body text-sm text-zinc-500">
          {copy.alternatePrompt}{" "}
          <Link
            href={registerHref}
            className="font-ui text-base font-bold uppercase tracking-wide text-emerald-500 underline decoration-emerald-500/30 underline-offset-4 transition-colors hover:text-emerald-400"
          >
            {copy.alternateCta}
          </Link>
        </p>
      </div>
    </form>
  );
}
