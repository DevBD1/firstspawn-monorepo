"use client";

import React from "react";
import Link from "next/link";

export type WLButtonVariant =
  | "primary"
  | "secondary"
  | "quiet"
  | "ghost"
  | "outline"
  | "danger"
  | "success"
  | "gold";

export type WLButtonSize = "sm" | "md" | "lg";

export interface WLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: WLButtonVariant;
  size?: WLButtonSize;
  fullWidth?: boolean;
  href?: string;
  children: React.ReactNode;
}

export function WLButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  href,
  disabled,
  style,
  ...props
}: WLButtonProps) {
  // Exact styles from Claude Design Worldlight prototype:
  // Base small button (like SIGN IN): fontSize 12.5, min-height 36, padding 8px 14px.
  // Base medium/large button: fontSize 13.5, min-height 44, padding 11px 20px.
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-family-ui), Onest, system-ui, sans-serif",
    fontWeight: 700,
    fontSize: size === "sm" ? 12.5 : 13.5,
    borderRadius: "var(--radius-control)",
    padding: size === "sm" ? "8px 14px" : "11px 20px",
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "filter 120ms, background 120ms",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    whiteSpace: "nowrap",
    minHeight: size === "sm" ? 36 : 44,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? "100%" : undefined,
  };

  const variantStyles: Record<WLButtonVariant, React.CSSProperties> = {
    primary: {
      background: "var(--primary)",
      color: "var(--on-primary)",
      borderColor: "var(--primary-hover)",
    },
    secondary: {
      background: "var(--secondary)",
      color: "var(--foreground)",
      borderColor: "var(--border)",
    },
    quiet: {
      background: "var(--secondary)",
      color: "var(--foreground)",
      borderColor: "var(--border)",
    },
    ghost: {
      background: "transparent",
      color: "var(--foreground)",
      borderColor: "var(--border)",
    },
    outline: {
      background: "transparent",
      color: "var(--foreground)",
      borderColor: "var(--border)",
    },
    danger: {
      background: "var(--danger)",
      color: "#ffffff",
      borderColor: "var(--danger-hover)",
    },
    success: {
      background: "var(--success)",
      color: "#ffffff",
      borderColor: "var(--success-hover)",
    },
    gold: {
      background: "var(--fs-gold)",
      color: "#1c1304",
      borderColor: "var(--border)",
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  const classes = `wl-btn ${className}`;

  if (href && !disabled) {
    const anchorProps = { ...props } as Record<string, unknown>;
    delete anchorProps.type;

    return (
      <Link
        href={href}
        className={classes}
        style={combinedStyle}
        {...(anchorProps as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} style={combinedStyle} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
