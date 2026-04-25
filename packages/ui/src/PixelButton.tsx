"use client";

import React from "react";
import Link from "next/link";

export type PixelButtonVariant =
  | "primary"
  | "diamond"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "authPrimary"
  | "authSecondary"
  | "discord"
  | "orange"
  | "gold";

export type PixelButtonSize = "sm" | "md" | "lg";

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  fullWidth?: boolean;
  href?: string;
  children: React.ReactNode;
}

const BUTTON_BASE_CLASSES =
  "relative inline-flex items-center justify-center border-2 uppercase transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70";

const VARIANT_CLASSES: Record<PixelButtonVariant, string> = {
  primary:
    "font-display tracking-wider bg-primary hover:bg-primary-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  diamond:
    "font-display tracking-wider bg-fs-diamond text-background border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-110",
  secondary:
    "font-display tracking-wider bg-secondary hover:bg-secondary-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  danger:
    "font-display tracking-wider bg-danger hover:bg-danger-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  success:
    "font-display tracking-wider bg-success hover:bg-success-hover text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  outline:
    "font-display tracking-wider bg-transparent border-fs-diamond text-accent-cyan shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-accent-cyan/10",
  authPrimary:
    "font-body text-lg font-bold tracking-[0.12em] border-emerald-700 bg-emerald-500 text-zinc-950 shadow-[4px_4px_0px_0px_#047857] hover:bg-emerald-400",
  authSecondary:
    "font-body text-lg font-bold tracking-[0.12em] border-zinc-600 bg-zinc-800 text-zinc-100 shadow-[4px_4px_0px_0px_#18181b] hover:bg-zinc-700",
  discord:
    "font-body text-lg font-bold tracking-[0.12em] border-[#4752C4] bg-[#5865F2] text-white shadow-[4px_4px_0px_0px_#3b44a3] hover:bg-[#4b56d1]",
  orange:
    "font-display tracking-wider bg-fs-orange text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  gold: "font-display tracking-wider bg-fs-gold text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
};

const SIZE_CLASSES: Record<PixelButtonSize, string> = {
  sm: "px-2 py-1 text-[8px]",
  md: "px-4 py-2 text-[10px]",
  lg: "px-6 py-3 text-xs",
};

export function PixelButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  href,
  disabled,
  ...props
}: PixelButtonProps) {
  const isSpecialVariant =
    variant === "authPrimary" || variant === "authSecondary" || variant === "discord";

  const sizeClass = isSpecialVariant ? "px-6 py-3" : SIZE_CLASSES[size];

  const classes = [
    BUTTON_BASE_CLASSES,
    VARIANT_CLASSES[variant],
    sizeClass,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    // Remove button-only props when rendering a Link
    const anchorProps = { ...props } as Record<string, unknown>;
    delete anchorProps.type;

    return (
      <Link
        href={href}
        className={classes}
        {...(anchorProps as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
