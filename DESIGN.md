# Design System

## Overview
A retro, 8-bit/pixel-art inspired dark interface for a developer productivity tool.
High-contrast colors, blocky shapes, and monospaced/pixel typography to evoke a classic gaming and coding aesthetic.

## Colors
**CRITICAL:** Never hardcode hex values in the generated code. Always use the project's configured Tailwind classes (which map to our CSS variables in `packages/ui/src/styles/brand.css`).

- **Background**: `bg-background` (var(--background))
- **Foreground**: `text-foreground` (var(--foreground))
- **Primary**: `bg-primary` / `text-primary` (var(--primary)). Hover: `hover:bg-primary-hover`.
- **Secondary**: `bg-secondary` / `text-secondary` (var(--secondary)). Hover: `hover:bg-secondary-hover`.
- **Success**: `bg-success` / `text-success` (var(--success)). Hover: `hover:bg-success-hover`.
- **Danger**: `bg-danger` / `text-danger` (var(--danger)). Hover: `hover:bg-danger-hover`.
- **Brand Accents**:
  - Cyan: `fs-diamond` (e.g., `bg-fs-diamond`, `border-fs-diamond`)
  - Gold: `fs-gold`
  - Orange: `fs-orange`
- **Surfaces**:
  - Navy 900: `fs-navy-900`
  - Navy 800: `fs-navy-800`
  - Panel: `bg-panel`
  - Navbar: `navbar-bg`
  - Footer: `footer-bg`
  - Footer Border: `footer-border`

## Typography
**CRITICAL:** Always use the project's configured Tailwind classes for fonts (which map to our typography tokens in `packages/ui/src/branding/tokens.ts`). Do not use standard sans/serif/mono tailwind classes.

- **Display/Headlines**: `font-display` (Press Start 2P) - Use for prominent titles and primary buttons.
- **UI/Labels**: `font-ui` (VT323) - Use for secondary labels, small text, and retro UI elements.
- **Body**: `font-body` (JetBrains Mono) - Use for primary readable content and most inputs.

## Grid & Spacing
- **Base Scale**: Always use a strict 4px/8px grid for all padding and margins (e.g., `p-2` is 8px). This reinforces the "blocky" pixel-art aesthetic and ensures visual consistency across platforms.
- **Web Strategy**:
  - Utilize a 12-column responsive grid for complex layouts.
  - Use wider gutters (`gap-6` to `gap-12`) to provide breathing room on large displays.
  - Wrap primary content in centered containers with a `max-width` (e.g., `max-w-7xl`).
- **Mobile Strategy**:
  - Simplify to 1 or 2-column vertical stacks.
  - Use tighter gutters (`gap-4`) to maximize information density on small screens.
  - Prefer full-bleed (edge-to-edge) containers for lists and cards.

## Layout & Structure
- **Navbar**: Ground the top of the application with `navbar-bg` (`bg-navbar-bg`). Keep it sticky or fixed, acting as a solid, high-contrast bar. Maintain consistent horizontal padding that adapts to the viewport (e.g., smaller padding on mobile, larger on desktop).
- **Footer**: Anchor the bottom of the application with `footer-bg` (`bg-footer-bg`), separated by a `footer-border` (`border-footer-border`) border. Keep footer content neatly arranged in flexible grid columns that stack vertically on mobile and expand horizontally on web.

## Animation
- **Philosophy**: Animations should feel snappy, instantaneous, and slightly mechanical. Avoid slow, smooth, buttery easing curves.
- **Interactions**: Use quick transitions (e.g., `duration-75` or `duration-150`). Active states on buttons should snap instantly.
- **Effects**: Arcade-style pulse animations (like "Insert Coin" text) or fast blinking are preferred over soft fades.

## Components
- **Buttons**: PixelButton. Square borders (border-2, black), sharp corners. Uses solid box-shadows (`4px 4px 0px 0px rgba(0,0,0,1)`) to create depth. Active states remove the shadow and translate the element down-right (`translate-x-[2px] translate-y-[2px]`) to simulate a physical mechanical press. Uppercase text with display font and wide tracking.
- **Cards**: PixelCard. High contrast border (border-4, black) with inset accents (e.g., cyan squares on corners) to simulate pixel art frames. Deep solid drop shadows (`8px 8px 0 rgba(0,0,0,0.5)`). Neon-accented inner borders. Titles often use pulse animations and bright accent colors (like success green).

## Do's and Don'ts
- Do use sharp, unrounded corners everywhere to maintain the pixel art aesthetic.
- Don't use subtle gradients or soft blurred drop-shadows; shadows should be solid and offset to create a blocky 3D effect.
- Do use uppercase tracking for buttons and important labels.
- Do leverage the brand accent colors (cyan, gold, orange, green) to make elements pop against the dark canvas.
- Don't mix modern, thin sans-serif fonts into the core UI.
