"use client";

import React from "react";
import Link from "next/link";

/**
 * Valid color variants for the PixelButton, mapped to semantic design tokens.
 */
export type PixelButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline"
  | "orange"
  | "gold"
  | "discord";

/**
 * Predefined size scales for the PixelButton.
 */
export type PixelButtonSize = "sm" | "md" | "lg";

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visual style variant of the button. Defaults to "primary". */
  variant?: PixelButtonVariant;
  /** The size scale of the button. Defaults to "md". */
  size?: PixelButtonSize;
  /** If true, the button will expand to fill the width of its container. */
  fullWidth?: boolean;
  /** If provided, renders the button as a Next.js Link component. */
  href?: string;
  /** The content to be rendered inside the button. */
  children: React.ReactNode;
}

const BUTTON_BASE_CLASSES =
  "relative inline-flex items-center justify-center border-2 border-black uppercase transition-all duration-75 font-ui tracking-widest active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

const VARIANT_CLASSES: Record<PixelButtonVariant, string> = {
  primary: "bg-primary hover:bg-primary-hover text-white",
  secondary: "bg-secondary hover:bg-secondary-hover text-white",
  danger: "bg-danger hover:bg-danger-hover text-white",
  success: "bg-success hover:bg-success-hover text-white",
  outline: "bg-transparent border-primary text-primary hover:bg-primary/10",
  orange: "bg-fs-orange hover:brightness-110 text-black",
  gold: "bg-fs-gold hover:brightness-110 text-black",
  discord: "bg-[#5865F2] hover:bg-[#4b56d1] text-white",
};

const SIZE_CLASSES: Record<PixelButtonSize, string> = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-lg",
};

/**
 * A mechanical, pixel-perfect button component following the FirstSpawn design system.
 *
 * It supports various semantic variants, sizes, and can automatically transition
 * to a Link component if an `href` prop is provided. The button features a solid
 * 4px shadow that "presses" into the page on click.
 *
 * @example
 * ```tsx
 * <PixelButton variant="primary" size="lg" onClick={() => console.log('clicked')}>
 *   Initialize Search
 * </PixelButton>
 * ```
 */
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
  const classes = [
    BUTTON_BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
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
