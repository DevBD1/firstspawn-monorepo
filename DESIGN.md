# Design System: FirstSpawn

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
- If web code needs a new Tailwind utility for a generated CSS variable, expose
  it in `apps/web/src/app/globals.css` under `@theme inline`.
- Do not hardcode hex values in app UI.
- Hardcoded hex values are allowed only inside token files or renderer surfaces
  that cannot consume CSS variables, such as generated OG images or email HTML.
- When code and this file disagree, update the code or update this file in the
  same change. Do not let this file become a mood board.

## 2. Visual Theme And Atmosphere

**Vibe:** technical, mechanical, trustworthy retro-futurism.

FirstSpawn should feel like a premium game server dashboard from 1994: blocky,
snappy, deeply technical, and readable on modern screens.

The interface is not a generic SaaS app. It should feel like:

- a server terminal
- a quest board
- a control panel
- a discovery HUD

It should not feel like:

- a soft gradient startup landing page
- a rounded mobile banking app
- a playful arcade toy
- a product roadmap dashboard for internal team status

## 3. Color Palette And Semantic Roles

Use semantic roles first. The hex values are references, not call sites.

| Role | Name | CSS Variable | Tailwind Token | Hex Reference | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Background | Deep Space Navy | `--background` | `bg-background` | `#05070A` | Main canvas |
| Surface | Control Panel Navy | `--bg-panel` | `bg-bg-panel` | `#0F172A` | Cards, modals, panels |
| Primary | Retro Blue | `--primary` | `bg-primary` | `#3B82F6` | Main actions, brand marks |
| Secondary | Slate Panel | `--secondary` | `bg-secondary` | `#1E293B` | Secondary actions |
| Success | Power-On Green | `--success` | `text-success` | `#39FF14` | Online, verified, active |
| Danger | Core Meltdown Red | `--danger` | `text-danger` | `#FF3131` | Errors, offline, destructive |
| Warning | Warning Orange | `--fs-orange` | `bg-fs-orange` | `#FF9500` | Alerts, notices |
| Premium | Legendary Gold | `--fs-gold` | `bg-fs-gold` | `#FFD700` | Premium, high trust |
| Text | High-Vis White | `--foreground` | `text-foreground` | `#E0E6ED` | Main readable text |
| Text Muted | Ghost Terminal Gray | `--muted` | `text-muted` | `#64748B` | Secondary labels |

Color rules:

- Primary actions use Retro Blue unless the action has a clear semantic state.
- Online and verified states use Power-On Green.
- Offline and destructive states use Core Meltdown Red.
- Premium, trust, and high-value highlights use Legendary Gold.
- Avoid introducing new colors without adding a semantic token.
- Third-party brand colors, such as Discord, must stay isolated to that
  integration component or be promoted into explicit tokens.
- Auth, admin, marketing, discovery, and server-detail pages all follow this
  root visual system. Do not create page-specific side palettes such as a
  separate auth-only emerald/zinc theme.

## 4. Typography

**Philosophy:** hierarchy over decoration. Readability is mandatory.

| Role | Class | Font | Usage |
| :--- | :--- | :--- | :--- |
| Display | `font-display` | Press Start 2P | Short labels, small badges, compact hero marks |
| UI | `font-ui` | VT323 | Nav, H2-H4, buttons, HUD labels |
| Body | `font-body` | JetBrains Mono | Descriptions, forms, server data, long text |

Typography rules:

- Because FirstSpawn is fully i18n, translated headings should default to
  `font-ui`.
- Use `font-display` only for stable short labels or explicit short display
  fields in dictionaries, such as `titleDisplay`. Keep display text under about
  20 characters when possible.
- Never render a translated sentence-like title with `font-display` as a
  fallback.
- Use `font-ui` for most headings and buttons.
- Use `font-body` for anything the user must read carefully.
- Prefer uppercase and wide tracking for labels.
- Do not use decorative pixel text for long paragraphs.

## 5. Shape, Borders, And Elevation

Core UI is sharp and mechanical.

Borders:

- Use 2px or 4px solid borders.
- Prefer black borders for mechanical panels and controls.
- Do not use rounded corners in core product UI.
- `rounded-none` is acceptable when overriding defaults.

Mechanical shadow:

- Raised: `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
- Pressed: `translate-x-[2px] translate-y-[2px] shadow-none`
- Large panels may use 8px or 12px solid-offset shadows.
- Avoid soft drop shadows for core UI.

Allowed exceptions:

- Gradients, blur, and glow are allowed only behind content in atmospheric layers
  and media areas: scene art, hero backgrounds, parallax scenes, map-like areas,
  server-card image regions, and generated OG images.
- These effects must stay behind content and must not be used on core controls,
  forms, navigation, filters, or content panels.
- Form inputs, buttons, card shells, navigation, filters, and server-card chrome
  should stay sharp unless there is a documented reason.

## 6. Components

### PixelButton

Use for primary and secondary actions.

Rules:

- Default shape: 2px black border, uppercase label, solid background.
- Default elevation: mechanical 4px shadow.
- Active state: move down/right by 2px and remove or reduce the shadow.
- Prefer `duration-75` or faster for press states.
- Disabled state should not rely on opacity alone. Prefer a muted fill, muted
  border, dithered treatment, or disabled cursor plus explicit disabled color.

Variants:

- `primary`: main action.
- `secondary`: supporting action.
- `success`: positive action or active state.
- `danger`: destructive action.
- `outline`: low-emphasis action.
- `orange`: alert/action highlight.
- `gold`: premium/trust action.
- Third-party variants must be kept explicit and isolated.
- Auth actions should use the same root button system and semantic color roles
  as the rest of the product.

### PixelCard

Use for panels, server previews, CTA blocks, and HUD sections.

Rules:

- Default shape: 4px black border.
- Default surface: `bg-bg-panel`.
- Default text: `text-foreground`.
- Bezel effect should use an inset muted border.
- Cards should not become generic rounded glass panels.

### Status Indicators

Use semantic state colors:

- Online: `--success`
- Offline: `--danger`
- Warning or pending: `--fs-orange`
- Premium or high trust: `--fs-gold`

Status dots may pulse, but motion should be stepped or staccato, not smooth and
soft.

## 7. Motion

**Philosophy:** snappy, mechanical, intentional.

Rules:

- Press states should feel like a physical switch.
- Use `duration-75` or `duration-0` for active control states.
- Use stepped animations such as `steps(2)` or `steps(4)` for pulses.
- Loading should use bit-filling bars or ASCII-style `/ - \ |` spinners.
- Avoid slow fades as the primary feedback pattern.

Allowed motion:

- Staggered section reveals.
- Parallax scene layers.
- Mechanical hover lift on cards.
- Stepped pulse for status and terminal effects.

Avoid:

- springy blob motion
- soft wellness-app fades
- constant decorative animation that competes with discovery/search

## 8. Grid And Spacing

Base unit: 4px.

Rules:

- Use spacing in multiples of 4px.
- Prefer Tailwind spacing tokens such as `p-1`, `p-2`, `p-4`, `gap-4`, `gap-8`.
- Use `gap-4` or `gap-8` for main layouts.
- Dense HUD areas may use tighter spacing, but text must remain readable.

## 9. Product UX Rules

FirstSpawn is discovery-first.

Rules:

- Average users care about current features and clearly marked coming-soon
  features. Do not expose internal roadmap metaphors as the main landing-page
  story.
- Discovery, trust, server activity, and player relevance should drive the UI.
- Make available-now features visually concrete.
- Mark coming-soon features honestly.
- Keep search and AI-assisted discovery as one shared concept when used across
  navbar and Discover.

## 10. AI Generation Guardrails

Use these rules when generating FirstSpawn UI with Stitch, v0, Codex, or any
other AI design/code tool:

- Start from this root design system. Do not invent a new visual direction.
- Use root tokens for product UI colors.
- For token changes, update `tokens.ts`, the strict generator mapping,
  generated `brand.css`, and web `@theme inline` exposure when needed.
- Keep every page on the same visual system, including auth and admin.
- Keep controls, forms, navigation, filters, cards, and server-card chrome
  sharp and mechanical.
- Use gradients, blur, and glow only in atmospheric layers and media regions.
- Use `font-ui` for translated headings.
- Use `font-display` only for stable short labels or explicit short display
  dictionary fields.
- Do not hardcode user-facing copy. Use dictionary-driven structure.
- Separate available-now features from coming-soon features.
- Prefer one shared pattern over duplicated page-local variants when the same
  behavior appears in more than one place.
- Keep feature-specific visuals inside the owning feature slice.
