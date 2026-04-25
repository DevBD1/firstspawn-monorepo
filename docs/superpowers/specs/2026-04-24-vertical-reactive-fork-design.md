# Design Spec: Vertical Reactive Discovery Fork
**Date:** 2026-04-24
**Topic:** Narrative Fork for Players and Server Hosts

## 1. Overview & Vision
FirstSpawn serves two primary user groups: **Players** looking for trustworthy discovery and **Server Hosts** looking for actionable growth data. This module visually represents this "Unified Duality" using a Yin-Yang inspired vertical split that dynamically reacts to user attention.

## 2. Visual Theme & Atmosphere
- **Concept**: A high-fidelity terminal module split into two parallel "Logic Streams."
- **Aesthetic**: 8-bit mechanical, utilizing high-contrast panels and strict grid alignment.
- **Colors**:
  - **Player Stream**: Background: `bg-bg-panel` (#0F172A), Accents: `Retro Blue` (#3B82F6).
  - **Host Stream**: Background: `bg-[#1E1A0A]` (Deep Gold-Black), Accents: `Legendary Gold` (#FFD700).

## 3. Architecture & Components
### `LandingDiscoveryFork.client.tsx`
- **Main Wrapper**: Full-width container with a minimum height of `650px`.
- **Vertical Rails**: Two parallel columns managed by a parent `flex` container.
- **Central Divider**: A fixed 8px black "Mechanical Seam" separating the two channels.

### Sub-Modules
- **Player Column**:
  - Header: `CHANNEL_01: PLAYER` (Press Start 2P, 8px).
  - Main Title: "Neural Discovery" (VT323, 42px).
  - Description: Technical Brutalist copy about playtime metrics (JetBrains Mono).
  - Primary Action: `START_EXPLORING` (PixelButton, Success/Blue).
- **Host Column**:
  - Header: `CHANNEL_02: HOST` (Press Start 2P, 8px).
  - Main Title: "Intelligence Hub" (VT323, 42px).
  - Description: Technical copy about traffic heatmaps and demographics (JetBrains Mono).
  - Primary Action: `ACCESS_DASHBOARD` (PixelButton, Gold).

## 4. Interaction & Motion Logic
- **The "Shift" (Attention Focus)**:
  - Default state: Both columns at `flex: 1` (50/50 split).
  - **Hover (Player)**: Player column expands to `flex: 3`, Host column shrinks to `flex: 1`.
  - **Hover (Host)**: Host column expands to `flex: 3`, Player column shrinks to `flex: 1`.
- **Snappy Transitions**:
  - All flex changes must use `transition: { duration: 0.25, ease: "steps(4)" }` to simulate a mechanical gear shift.
- **Phosphor Reactivity**:
  - The focused side should increase in opacity from `0.6` to `1.0`.
  - Focused headers trigger a subtle `animate-retro-pulse`.

## 5. Implementation Notes
- Use `framer-motion` for all layout transitions.
- Ensure `clip-path` is not needed as the dikey (vertical) split is handled via pure flexbox for better responsive reliability.
- Vertical "Scanlines" overlay must remain active to tie the module into the overall terminal atmosphere.

## 6. Testing & Validation
- **Readability Check**: Verify contrast ratios for Gold text on Dark-Gold backgrounds.
- **Responsiveness**: On mobile (sm), the split must revert to a vertical stack (Player on top, Host below) with `flex: none`.
- **Haptic Check**: Verify the `steps(4)` easing doesn't feel jarring, but "snappy."
