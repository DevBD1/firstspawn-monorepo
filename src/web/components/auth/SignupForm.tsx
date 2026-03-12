"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";

interface SignupFormCopy {
  emailLabel: string;
  emailPlaceholder: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  submitLabel: string;
  alternatePrompt: string;
  alternateCta: string;
  termsLabelPrefix: string;
  termsLabelCta: string;
  privacyLabelPrefix: string;
  privacyLabelCta: string;
  marketingConsentLabel: string;
}

interface SignupFormProps {
  lang: string;
  nextPath?: string;
  copy: SignupFormCopy;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display mt-2 w-full border-2 border-black bg-success px-4 py-3 text-[11px] uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-success-hover disabled:cursor-not-allowed disabled:opacity-70 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
    >
      {pending ? "PROCESSING..." : label}
    </button>
  );
}

export default function SignupForm({ lang, nextPath, copy }: SignupFormProps) {
  const [state, action] = useActionState(registerAction, AUTH_ACTION_INITIAL_STATE);
  const [showPasswords, setShowPasswords] = useState(false);
  const fieldErrors = state?.fieldErrors ?? {};
  const message = state?.message ?? null;
  const loginHref = nextPath
    ? `/${lang}/login?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/login`;

  return (
    <form action={action} className="space-y-4" autoComplete="on">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath || ""} />

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="signup-email">
          {copy.emailLabel}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="section-signup email"
          inputMode="email"
          placeholder={copy.emailPlaceholder}
          className="w-full border-2 border-black bg-zinc-900 px-4 py-3 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
        />
        {fieldErrors.email ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="signup-username">
          {copy.usernameLabel}
        </label>
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
          className="w-full border-2 border-black bg-zinc-900 px-4 py-3 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
        />
        {fieldErrors.username ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.username}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="signup-password">
          {copy.passwordLabel}
        </label>
        <div className="relative">
          <input
            id="signup-password"
            name="password"
            type={showPasswords ? "text" : "password"}
            required
            minLength={8}
            autoComplete="section-signup new-password"
            placeholder={copy.passwordPlaceholder}
            className="w-full border-2 border-black bg-zinc-900 px-4 py-3 pr-24 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((previous) => !previous)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-secondary text-white hover:bg-secondary-hover"
            aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
          >
            {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="signup-confirm-password">
          {copy.confirmPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="signup-confirm-password"
            name="confirmPassword"
            type={showPasswords ? "text" : "password"}
            required
            minLength={8}
            autoComplete="section-signup new-password"
            placeholder={copy.confirmPasswordPlaceholder}
            className="w-full border-2 border-black bg-zinc-900 px-4 py-3 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
          />
        </div>
        {fieldErrors.confirmPassword ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      <div className="space-y-3 border-2 border-black bg-zinc-900/60 p-4">
        <label
          htmlFor="signup-terms-accepted"
          className="flex cursor-pointer items-start gap-3 font-ui text-sm text-zinc-200"
        >
          <input
            id="signup-terms-accepted"
            name="termsAccepted"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-fs-diamond"
          />
          <span>
            {copy.termsLabelPrefix}{" "}
            <Link href={`/${lang}/terms`} className="font-ui text-sm font-semibold text-fs-diamond underline underline-offset-2 hover:text-cyan-300">
              {copy.termsLabelCta}
            </Link>
            .
          </span>
        </label>
        {fieldErrors.termsAccepted ? (
          <p className="font-ui text-sm text-red-400">{fieldErrors.termsAccepted}</p>
        ) : null}

        <label
          htmlFor="signup-privacy-accepted"
          className="flex cursor-pointer items-start gap-3 font-ui text-sm text-zinc-200"
        >
          <input
            id="signup-privacy-accepted"
            name="privacyAccepted"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 shrink-0 accent-fs-diamond"
          />
          <span>
            {copy.privacyLabelPrefix}{" "}
            <Link href={`/${lang}/privacy`} className="font-ui text-sm font-semibold text-fs-diamond underline underline-offset-2 hover:text-cyan-300">
              {copy.privacyLabelCta}
            </Link>
            .
          </span>
        </label>
        {fieldErrors.privacyAccepted ? (
          <p className="font-ui text-sm text-red-400">{fieldErrors.privacyAccepted}</p>
        ) : null}

        <label
          htmlFor="signup-marketing-consent"
          className="flex cursor-pointer items-start gap-3 font-ui text-sm text-zinc-300"
        >
          <input
            id="signup-marketing-consent"
            name="marketingConsent"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-fs-diamond"
          />
          <span>{copy.marketingConsentLabel}</span>
        </label>
      </div>

      {message ? (
        <div className="border-2 border-black bg-red-950/70 px-4 py-3 font-ui text-sm text-red-300">
          {message}
        </div>
      ) : null}

      <SubmitButton label={copy.submitLabel} />

      <p className="pt-2 text-center font-ui text-sm text-zinc-400">
        {copy.alternatePrompt}{" "}
        <Link href={loginHref} className="font-display text-[10px] uppercase tracking-wider text-fs-diamond hover:text-cyan-300">
          {copy.alternateCta}
        </Link>
      </p>
    </form>
  );
}
