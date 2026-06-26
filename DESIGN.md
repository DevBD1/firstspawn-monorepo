# Design System: FirstSpawn — Worldlight

> **What this answers** — The product UI/UX system: visual language, tokens,
> components, and screen flows.
>
> **Open when** — You're building or changing anything users see.
>
> Replaces the retired "Pixel" direction. Drop-in replacement for the
> root `DESIGN.md`; pair with `handoff/tokens.ts` →
> `packages/ui/src/branding/tokens.ts`.

## 1. Source Of Truth

This file is the only product UI/UX source of truth for FirstSpawn.
Skills may reference it, but must not define competing UI/UX truth.

Implementation tokens live in:

- `packages/ui/src/branding/tokens.ts`: canonical cross-platform token values.
- `packages/ui/src/styles/brand.css`: generated web CSS variable adapter.
- `apps/web/src/app/globals.css`: web-only Tailwind mapping and utilities.

Rules:

- Use token-backed Tailwind classes or CSS variables for product UI colors.
- Edit token values in `tokens.ts`, then run
  `pnpm --filter @firstspawn/ui generate:styles`.
- When adding, removing, or renaming tokens, update the strict mapping in
  `packages/ui/scripts/generate-brand-css.cjs` in the same change.
- `brand.css` is generated. Do not edit it by hand.
- Do not hardcode hex values in app UI. Hardcoded hex is allowed only inside
  token files or renderer surfaces that cannot consume CSS variables.
- When code and this file disagree, update one of them in the same change.

Pixel retirement:

- The Pixel/retro-terminal direction (Press Start 2P, VT323, 2px black
  borders, offset mechanical shadows, Power-On Green `#39FF14`) is retired.
- `PixelButton` and `PixelCard` should be migrated to the Worldlight button
  and card recipes below, then removed. Do not build new UI on them.
- Do not mix Pixel motifs (hard offset shadows, square-only corners, CRT
  scanlines, stepped pulses) into Worldlight surfaces.

## 2. Visual Theme And Atmosphere

**Vibe:** warm, calm, trustworthy exploration — dusk light over a living
world.

FirstSpawn should feel like a well-made field guide to player worlds:
editorial, data-honest, and quietly premium. Two modes share one identity:
**Dusk** (default, deep blue-grey night) and **Day** (warm paper light).

It should feel like:

- a trusted atlas of worlds
- a calm observatory dashboard
- an editorial review site with real measurements

It should not feel like:

- a retro terminal or arcade cabinet
- a neon gamer hub or esports overlay
- a soft gradient startup landing page

Atmosphere (gradients, layered world art) lives only in hero and media
regions, always behind content. Core controls, forms, navigation, filters,
and cards stay flat and quiet.

## 3. Color Palette And Semantic Roles

Accent is **Dawn Gold**. Use semantic roles first; hex values are
references, not call sites. Dusk / Day values:

| Role | Token | Dusk | Day | Usage |
| :--- | :--- | :--- | :--- | :--- |
| Canvas | `canvas` | `#12151E` | `#F2EFE7` | Page background |
| Panel | `panel` | `#1A1F2B` | `#FBF9F4` | Cards, modals, nav |
| Raised | `raised` | `#222838` | `#FFFFFF` | Hover rows, wells, quiet buttons |
| Text | `text` | `#EDEFF4` | `#23272F` | Primary text |
| Muted | `muted` | `#8B92A6` | `#6E7280` | Labels, metadata |
| Line | `line` | `#2A3040` | `#E2DDD0` | 1px borders, dividers |
| Accent | `accent` | `#E5A04C` | `#B26F1F` | Primary actions, active states, brand |
| Accent deep | `accentDeep` | `#C7822F` | `#8F5717` | Primary borders, hover |
| On accent | `onAccent` | `#1C1304` | `#FFF6E8` | Text on accent fills |
| Success | `success` | `#62C887` | `#2E7D4F` | Online, voted, verified-ok |
| Danger | `danger` | `#E0635C` | `#B6453E` | Offline, errors, reports |
| Gold | `gold` | `#E7C56A` | `#9A7B2E` | Verified ✓, premium, #1 rank |
| Link | `link` | `#9FB4E8` | `#3D5FA8` | Inline links |
| Art | `art` / `artDim` | `#7D8BB0` / `#6E7A9C` | `#A89A78` / `#9A8C6C` | Media placeholder tones |

Color rules:

- Primary actions use Dawn Gold (`accent` fill, `accentDeep` border,
  `onAccent` text) unless the action has a clear semantic state.
- Online, measured-good, and "voted" states use `success`.
- Offline, destructive, and under-review states use `danger`.
- Verified ✓, premium, and first-place highlights use `gold` — keep it
  distinct from `accent`; gold is earned, accent is interactive.
- Warning/pending states use muted text with dashed `line` borders — there
  is no orange in Worldlight.
- Day-mode accents are darkened for AA contrast on the light canvas. Never
  use dusk accent values on day surfaces.
- Avoid introducing new colors without adding a semantic token.
- Auth, admin, marketing, discovery, and server-detail pages all follow this
  root visual system. No page-local side palettes.

## 4. Typography

**Philosophy:** hierarchy over decoration. Readability is mandatory.

| Role | Font | Usage |
| :--- | :--- | :--- |
| Display | Unbounded (400–700) | H1–H2, server names, brand wordmark |
| UI / Body | Onest (400–700) | Nav, buttons, labels, paragraphs, forms |
| Data | JetBrains Mono (400–700) | Measured numbers, addresses, provenance notes, ranking math |

Typography rules:

- Unbounded is for identity moments only — page titles, server names, the
  wordmark. Never for paragraphs, never below ~15px.
- Everything a user reads or operates is Onest.
- Anything **measured or machine-derived** renders in JetBrains Mono:
  player counts, uptime, rank math, server addresses, freshness stamps,
  provenance chips. This mono = measured convention is a core trust cue —
  keep it strict.
- Section labels: 11px Onest 700, uppercase, `0.12–0.14em` tracking, muted.
- Translated headings default to Onest; Unbounded only for short stable
  display fields.

## 5. Shape, Borders, And Elevation

Worldlight is soft but disciplined.

Borders: 1px solid `line` everywhere. Dashed `line` borders signal
pending/empty/coming-soon states.

Radius scale (use these stops only): 6 tag · 8 badge/chip-note · 10
control/input/button · 12 card/row popover · 14 panel · 16 modal · 999 pill.

Elevation:

- Resting cards: `0 1px 0` hairline shadow (token `shadow`).
- Hover cards: lift `translateY(-2px)` + accent border.
- Popovers: `0 12px 32px rgba(0,0,0,0.28)`.
- Modals: `0 24px 64px rgba(0,0,0,0.45)`.
- No offset/mechanical shadows. No glow on controls.

## 6. Components

### Button (WLButton recipe)

- `primary`: accent fill, accentDeep 1px border, onAccent text, 700 weight.
- `quiet`: raised fill, line border — secondary actions.
- `ghost`: transparent, line border — low-emphasis actions.
- Radius 10, min-height 44 (36 small). Hover: `brightness(1.08)`.
  Active: `brightness(0.95)`. Focus-visible: 2px accent outline.
- Disabled: reduced opacity plus disabled cursor — never opacity alone on
  primary destructive actions.

### Card / Row

- Panel fill, 1px line border, radius 12–14, hairline shadow.
- Hover (when clickable): 2px lift + accent border.
- List rows share borders (collapsed 1px grid), raised fill on hover.

### Chips

- Pill radius. Inactive: transparent fill, line border, muted text.
  Active: accent fill, accentDeep border, onAccent text.

### Status Indicators

- Online: `success` dot + count. Offline: `danger`. Verified ✓ and
  standing ≥ Verified: `gold`. Pending: dashed border + muted.
- Signal bars (activity/trust/freshness) fill with `accent` on a `line`
  track; values in mono.

## 7. Motion

**Philosophy:** calm, quick, honest.

- 120ms ease for hover/background/border transitions; nothing slower than
  200ms on controls.
- Card hover lift and row tint are the primary feedback patterns.
- Blinking cursor (`step-start`) is reserved for live processes (render
  studio); honor `prefers-reduced-motion`.
- No springy motion, no constant decorative animation, no stepped/staccato
  pulses (Pixel motif).

## 8. Grid And Spacing

Base unit: 4px. Content max-width 1200px with 28px gutters.

- Page sections: 26–44px vertical rhythm.
- Card padding: 14–26px by size; gaps 10–16px within, 12–28px between.
- Sticky chrome (nav, filter rail, side cards) offsets at top 76px.

## 9. Product UX Rules

FirstSpawn is discovery-first.

- Discovery, trust, server activity, and player relevance drive the UI.
- MVP discovery rank is current UTC calendar-month valid vote count, the same
  rule for every server, and is never sold. Label it honestly as "Most voted
  this month" rather than trust or quality.
- Votes are an engagement/popularity signal, not a trust signal. Verified
  control, measured uptime, moderation history, and future optional telemetry
  must be presented separately.
- Online state and uptime never boost or penalize MVP discovery rank. Region
  and collector-measured supported-version filters may refine the result set.
- Future paid event placement must be clearly disclosed, live outside the
  organic Discover rank, and never alter that rank.
- Measured data and owner-declared data must stay visually distinct
  (mono + "measured" vs. plain text + "owner-declared").
- Make available-now features visually concrete; mark coming-soon features
  honestly (dashed border treatment).
- MVP navigation exposes only working discovery, listing, owner, and auth
  surfaces. Community, Loot, forum, social, and other future sections stay out
  of navigation.
- Keep search and AI-assisted discovery one shared concept across navbar
  and Discover when AI-assisted discovery is implemented; interpreted facets
  are always shown to the user.

## 10. AI Generation Guardrails

When generating FirstSpawn UI with any AI design/code tool:

- Start from this root design system. Do not invent a new visual direction
  and do not resurrect Pixel motifs.
- Use root tokens for product UI colors; accent is Dawn Gold.
- Respect the mono = measured typography convention.
- Keep every page on the same visual system, including auth and admin.
- 1px borders, the fixed radius scale, hairline/lift elevation only.
- Gradients and layered art only in hero/media regions, behind content.
- Do not hardcode user-facing copy. Use dictionary-driven structure.
- Prefer one shared pattern over duplicated page-local variants.
