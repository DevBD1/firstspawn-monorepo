"use client";

import React from "react";

/**
 * Valid color variants for the PixelCard, mapped to semantic design tokens.
 */
export type PixelCardVariant =
  | "panel"
  | "primary"
  | "secondary"
  | "dark"
  | "success"
  | "danger"
  | "orange"
  | "gold";

interface PixelCardProps {
  /** The content to be rendered inside the card. */
  children: React.ReactNode;
  /** Optional additional CSS classes to apply to the card shell. */
  className?: string;
  /** The visual style variant of the card. Defaults to "panel". */
  variant?: PixelCardVariant;
  /** If true, renders an inset bezel effect for a "pressed" or "layered" 90s look. Defaults to true. */
  bezel?: boolean;
}

const VARIANT_CLASSES: Record<PixelCardVariant, string> = {
  panel: "bg-bg-panel text-foreground",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  dark: "bg-background text-foreground",
  success: "bg-success/5 border-success/50 text-success",
  danger: "bg-danger/5 border-danger/50 text-danger",
  orange: "bg-fs-orange/5 border-fs-orange/50 text-fs-orange",
  gold: "bg-fs-gold/5 border-fs-gold/50 text-fs-gold",
};

/**
 * A mechanical, sharp-edged container for HUD elements, server previews, and control panels.
 *
 * Following the 1994 server terminal aesthetic from DESIGN.md, it features a heavy
 * 4px black border and a solid 8px shadow.
 *
 * @example
 * ```tsx
 * <PixelCard variant="panel" bezel={true}>
 *   <h2 className="font-ui text-xl uppercase">System Status</h2>
 *   <p className="font-body text-sm text-muted">All nodes operational.</p>
 * </PixelCard>
 * ```
 */
export function PixelCard({
  children,
  className = "",
  variant = "panel",
  bezel = true,
}: PixelCardProps) {
  const baseStyles =
    "relative border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all duration-75";

  // The bezel provides an inset "pressed" or "layered" look common in 90s UI
  const bezelStyles = bezel
    ? "before:absolute before:inset-[2px] before:border-2 before:border-muted/10 before:pointer-events-none"
    : "";

  return (
    <div className={`${baseStyles} ${VARIANT_CLASSES[variant]} ${bezelStyles} ${className}`}>
      {children}
    </div>
  );
}
