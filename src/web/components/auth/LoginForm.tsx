"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { AUTH_ACTION_INITIAL_STATE } from "@/lib/auth-action-state";

interface LoginFormCopy {
  identifierLabel: string;
  identifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitLabel: string;
  alternatePrompt: string;
  alternateCta: string;
}

interface LoginFormProps {
  lang: string;
  nextPath?: string;
  copy: LoginFormCopy;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="font-display mt-2 w-full border-2 border-black bg-primary px-4 py-3 text-[11px] uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
    >
      {pending ? "AUTHENTICATING..." : label}
    </button>
  );
}

export default function LoginForm({ lang, nextPath, copy }: LoginFormProps) {
  const [state, action] = useActionState(loginAction, AUTH_ACTION_INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const fieldErrors = state?.fieldErrors ?? {};
  const message = state?.message ?? null;
  const signupHref = nextPath
    ? `/${lang}/signup?next=${encodeURIComponent(nextPath)}`
    : `/${lang}/signup`;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="next" value={nextPath || ""} />

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="login-identifier">
          {copy.identifierLabel}
        </label>
        <input
          id="login-identifier"
          name="identifier"
          type="text"
          required
          minLength={3}
          autoComplete="username"
          placeholder={copy.identifierPlaceholder}
          className="w-full border-2 border-black bg-zinc-900 px-4 py-3 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
        />
        {fieldErrors.identifier ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.identifier}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block font-display text-[10px] uppercase tracking-wider text-zinc-300" htmlFor="login-password">
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
            className="w-full border-2 border-black bg-zinc-900 px-4 py-3 pr-24 font-ui text-base text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-fs-diamond"
          />
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center border-2 border-black bg-secondary text-white hover:bg-secondary-hover"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="mt-2 font-ui text-sm text-red-400">{fieldErrors.password}</p>
        ) : null}
      </div>

      {message ? (
        <div className="border-2 border-black bg-red-950/70 px-4 py-3 font-ui text-sm text-red-300">
          {message}
        </div>
      ) : null}

      <SubmitButton label={copy.submitLabel} />

      <p className="pt-2 text-center font-ui text-sm text-zinc-400">
        {copy.alternatePrompt}{" "}
        <Link href={signupHref} className="font-display text-[10px] uppercase tracking-wider text-fs-diamond hover:text-cyan-300">
          {copy.alternateCta}
        </Link>
      </p>
    </form>
  );
}
