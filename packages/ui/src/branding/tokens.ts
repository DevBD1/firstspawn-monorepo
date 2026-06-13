/**
 * Canonical cross-platform design tokens for FirstSpawn — Worldlight theme.
 * Replaces the retired Pixel palette in packages/ui/src/branding/tokens.ts.
 *
 * Web CSS variables are generated from these values, and mobile should import
 * this object directly instead of duplicating colors.
 *
 * Worldlight is two-mode (dusk = default, day = light). `worldlightModes`
 * carries both; `firstspawnBrandColors` stays flat (dusk values) so the
 * strict generator mapping in generate-brand-css.cjs keeps working — update
 * that mapping in the same change when adopting the renamed tokens.
 */

export const worldlightModes = {
  dusk: {
    canvas: "#12151E", // Main app canvas and page background.
    panel: "#1A1F2B", // Default card, modal, and navigation surface.
    raised: "#222838", // Raised fills: hover rows, inset wells, quiet buttons.
    text: "#EDEFF4", // Primary readable text.
    muted: "#8B92A6", // Secondary labels, helper text, low-emphasis metadata.
    line: "#2A3040", // 1px hairline borders and dividers.
    accent: "#E5A04C", // Dawn Gold — primary actions, brand mark, active states.
    accentDeep: "#C7822F", // Dawn Gold deep — primary borders, hover/pressed.
    onAccent: "#1C1304", // Text/icons placed on accent fills.
    success: "#62C887", // Online, verified-ok, positive state.
    danger: "#E0635C", // Offline, errors, reports under review, destructive.
    gold: "#E7C56A", // Premium, verified ✓, high-trust highlight.
    link: "#9FB4E8", // Inline links and verified link labels.
    inputBg: "rgba(26,31,43,0.92)", // Form input fill.
    art: "#7D8BB0", // Media/placeholder tone — banners, world renders.
    artDim: "#6E7A9C", // Dimmer media tone — icons, screenshots, trailers.
  },
  day: {
    canvas: "#F2EFE7",
    panel: "#FBF9F4",
    raised: "#FFFFFF",
    text: "#23272F",
    muted: "#6E7280",
    line: "#E2DDD0",
    accent: "#B26F1F", // Dawn Gold, darkened for AA contrast on light canvas.
    accentDeep: "#8F5717",
    onAccent: "#FFF6E8",
    success: "#2E7D4F",
    danger: "#B6453E",
    gold: "#9A7B2E",
    link: "#3D5FA8",
    inputBg: "#FFFFFF",
    art: "#A89A78",
    artDim: "#9A8C6C",
  },
} as const;

/**
 * Flat default-mode (dusk) map under the legacy semantic names consumed by
 * the CSS generator. Values are Worldlight; names are unchanged where a
 * 1:1 role exists.
 */
export const firstspawnBrandColors = {
  // Canvas and text
  background: "#12151E", // Main app canvas (was Deep Space Navy).
  foreground: "#EDEFF4", // Primary readable text.
  muted: "#8B92A6", // Secondary labels and helper text.
  border: "#2A3040", // 1px hairline borders — no more black pixel borders.

  // Surfaces and supporting fills
  bgPanel: "#1A1F2B", // Default panel, card, modal, and navigation surface.
  secondary: "#222838", // Raised/secondary fill (quiet buttons, hover rows).
  secondaryHover: "#2A3144", // Hover fill for secondary actions.
  inputBg: "rgba(26,31,43,0.92)", // Form input fill.

  // Brand and primary actions — Dawn Gold
  primary: "#E5A04C", // Main brand action color (Dawn Gold).
  primaryHover: "#C7822F", // Hover/pressed fill and primary border.
  onPrimary: "#1C1304", // Text on primary fills.

  // State and signal colors
  success: "#62C887", // Online, verified, active, positive.
  successHover: "#55B97A",
  danger: "#E0635C", // Offline, error, destructive.
  dangerHover: "#CF544D",
  fsGold: "#E7C56A", // Premium, verified ✓, high-trust highlight.
  link: "#9FB4E8", // Inline links.
  art: "#7D8BB0", // Media/placeholder tone.
  artDim: "#6E7A9C", // Dimmer media tone.
} as const;

/**
 * Canonical typeface names used by platform adapters.
 */
export const firstspawnBrandTypography = {
  displayFamily: "Unbounded", // H1–H2, server names, brand wordmark.
  uiFamily: "Onest", // Nav, buttons, labels, body copy, forms.
  bodyFamily: "Onest", // Same as UI — Worldlight uses one humanist family.
  monoFamily: "JetBrains Mono", // Measured data, addresses, provenance notes.
} as const;

/**
 * Corner radius scale (px). Worldlight is soft but disciplined — use these
 * five stops only.
 */
export const worldlightRadii = {
  tag: 6, // Tiny metadata tags (country codes, mini icons).
  badge: 8, // Provenance chips, step badges, canonical-URL pills.
  control: 10, // Buttons, inputs, selects, vote buttons, stat tiles.
  card: 12, // Cards, rows' popovers, feature cards.
  panel: 14, // Large panels, join card, console sections.
  modal: 16, // Modal shells.
  pill: 999, // Chips, filter pills, verified pill, mode toggle.
} as const;

/**
 * Elevation shadows (dusk values — day overrides the card shadow in
 * apps/web globals.css alongside the day color overrides).
 */
export const worldlightShadows = {
  card: "0 1px 0 rgba(0,0,0,0.4)", // Resting card/panel shadow.
  popover: "0 12px 32px rgba(0,0,0,0.28)", // Popovers, dropdowns, tooltips.
  modal: "0 24px 64px rgba(0,0,0,0.45)", // Modal shells.
} as const;

export const firstspawnBrandTokens = {
  colors: firstspawnBrandColors,
  modes: worldlightModes,
  typography: firstspawnBrandTypography,
  radii: worldlightRadii,
  shadows: worldlightShadows,
} as const;

export type FirstspawnBrandColors = typeof firstspawnBrandColors;
export type FirstspawnBrandTypography = typeof firstspawnBrandTypography;
export type FirstspawnBrandTokens = typeof firstspawnBrandTokens;
export type WorldlightModes = typeof worldlightModes;
