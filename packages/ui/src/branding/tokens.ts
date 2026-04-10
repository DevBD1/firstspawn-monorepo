export const firstspawnBrandColors = {
  background: "#050505",
  foreground: "#f0f0f0",
  border: "#000000",
  fsDiamond: "#22d3ee",
  fsNavy900: "#0b131a",
  fsNavy800: "#0f161c",
  fsGold: "#ffd700",
  fsOrange: "#cc5500",
  navbarBg: "#333333",
  footerBg: "#111111",
  footerBorder: "#3d3d3d",
  footerGrid: "#333333",
  bgPanel: "#222222",
  primary: "#3b82f6",
  primaryHover: "#2563eb",
  secondary: "#333333",
  secondaryHover: "#52525b",
  success: "#4ade80",
  successHover: "#22c55e",
  danger: "#dc2626",
  dangerHover: "#ef4444",
  accentCyan: "#22d3ee",
} as const;

export const firstspawnBrandTypography = {
  displayFamily: "Press Start 2P",
  uiFamily: "VT323",
  bodyFamily: "JetBrains Mono",
} as const;

export const firstspawnBrandTokens = {
  colors: firstspawnBrandColors,
  typography: firstspawnBrandTypography,
} as const;

export type FirstspawnBrandColors = typeof firstspawnBrandColors;
export type FirstspawnBrandTypography = typeof firstspawnBrandTypography;
export type FirstspawnBrandTokens = typeof firstspawnBrandTokens;
