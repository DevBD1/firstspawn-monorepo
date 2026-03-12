"use client";

import type { ButtonHTMLAttributes } from "react";

type AuthPixelButtonVariant = "primary" | "secondary" | "discord";

export interface AuthPixelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AuthPixelButtonVariant;
}

const BASE_CLASSES =
  "relative border-2 px-6 py-3 font-body text-lg font-bold uppercase tracking-[0.12em] transition-all duration-150 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70";

const VARIANT_CLASSES: Record<AuthPixelButtonVariant, string> = {
  primary:
    "border-emerald-700 bg-emerald-500 text-zinc-950 shadow-[4px_4px_0px_0px_#047857] hover:bg-emerald-400",
  secondary:
    "border-zinc-600 bg-zinc-800 text-zinc-100 shadow-[4px_4px_0px_0px_#18181b] hover:bg-zinc-700",
  discord:
    "border-[#4752C4] bg-[#5865F2] text-white shadow-[4px_4px_0px_0px_#3b44a3] hover:bg-[#4b56d1]",
};

const joinClasses = (...values: Array<string | undefined>): string =>
  values.filter(Boolean).join(" ");

export default function AuthPixelButton({
  variant = "primary",
  className,
  type = "button",
  ...props
}: AuthPixelButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}
