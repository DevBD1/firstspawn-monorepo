/**
 * Canonical cross-platform color tokens for FirstSpawn.
 * Web CSS variables are generated from these values, and mobile should import
 * this object directly instead of duplicating colors.
 */
export const firstspawnBrandColors = {
  // Canvas and text
  background: "#05070a", // Main app canvas and page background.
  foreground: "#e0e6ed", // Primary readable text on dark surfaces.
  muted: "#64748b", // Secondary labels, helper text, and low-emphasis metadata.
  border: "#000000", // Mechanical pixel borders and hard component outlines.

  // Surfaces and supporting fills
  bgPanel: "#0f172a", // Default panel, card, modal, and navigation surface.
  bgHostPanel: "#1e1a0a", // Warm host-side panel background in split landing scenes.
  secondary: "#1e293b", // Secondary action fill and darker supporting surface.
  secondaryHover: "#334155", // Hover fill for secondary actions.

  // Brand and primary actions
  primary: "#3b82f6", // Main brand action color and primary interactive accent.
  primaryHover: "#2563eb", // Hover fill for primary actions.
  fsDiamond: "#3b82f6", // Diamond/trending accent; aliases primary for current palette.

  // State and signal colors
  success: "#39ff14", // Online, verified, active, and positive state color.
  successHover: "#32e612", // Hover fill for success actions.
  danger: "#ff3131", // Offline, error, destructive, and failure state color.
  dangerHover: "#e62c2c", // Hover fill for danger actions.
  fsOrange: "#ff9500", // Warning, alert, notification, and pending state color.
  fsGold: "#ffd700", // Premium, high-trust, and high-value highlight color.

  // Atmospheric effects
  errorGlow: "#e28c8c", // Atmospheric error glow for narrative landing sections.
  scanlineColor: "#121010", // CRT scanline and terminal overlay base color.
} as const;

/**
 * Canonical typeface names used by platform adapters.
 * Web wraps these with Next font CSS variables; mobile can resolve the names
 * through its own font-loading layer.
 */
export const firstspawnBrandTypography = {
  displayFamily: "Press Start 2P", // Short badges, logo marks, and explicit display labels.
  uiFamily: "VT323", // Translated headings, buttons, nav, and HUD labels.
  bodyFamily: "JetBrains Mono", // Paragraphs, forms, server data, and readable content.
} as const;

/**
 * Aggregated token object for consumers that need the full design token set.
 */
export const firstspawnBrandTokens = {
  colors: firstspawnBrandColors, // Cross-platform color token map.
  typography: firstspawnBrandTypography, // Cross-platform typography token map.
} as const;

export type FirstspawnBrandColors = typeof firstspawnBrandColors;
export type FirstspawnBrandTypography = typeof firstspawnBrandTypography;
export type FirstspawnBrandTokens = typeof firstspawnBrandTokens;
