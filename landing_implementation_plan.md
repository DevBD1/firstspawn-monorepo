# Implement Ultimate Landing Page Design

We will transition the current landing page into a high-performance discovery hub focusing on "Speed", "Frictionless Decision Making," and "Technical SEO." The core philosophy is to remove fluffy value propositions and usher players straight into discovering relevant, highly populated servers, passing authority down into our dynamic server profile pages.

## User Review Required

> [!IMPORTANT]
> This plan involves replacing the current "fluffy" hero subtitle and stats with a massive Search Bar and Quick Tags. This represents a primary UX shift for the platform's entry point.

## Proposed Changes

### Landing UI Features

#### [MODIFY] `apps/web/src/features/landing/components/LandingPage.client.tsx`
- **Instant Discovery:** Remove the generic text and replace the `HeroScene` bounds with a new `HeroSearchBar` and `QuickTags` row (e.g., Survival, PvP, Faction).
- **Link Equity Section:** Incorporate a "Trending Servers" section beneath the Hero to pass PageRank directly to popular server profiles.
- **Design System Application:** Maintain the dark mode aesthetic, applying strict 4px/8px grid spacing.

#### [NEW] `apps/web/src/features/landing/components/HeroSearchBar.tsx`
- A retro-styled, massive input field. It will feature the thick `border-4` and solid dropshadows (`shadow-[4px_4px_0_0_rgba(0,0,0,1)]`) characteristic of our UI. It acts as the central interaction point on load.

#### [NEW] `apps/web/src/features/landing/components/QuickTags.tsx`
- A row of `PixelButton` or tag elements below the search bar to facilitate one-click filtering.

### Server Profiles & Discovery Pipeline

#### [NEW] `apps/web/src/features/server/components/ServerCard.tsx`
- **Frictionless Decision Making:** Create a server card displaying vital information at a glance using pixel-art styling.
- **Live Data:** Features a glowing green live player counter (using Framer Motion pulse animation).
- **Icons:** Includes simple indicators for Server Version, Ping Status, and Required Mods.

#### [MODIFY] `apps/web/src/app/[lang]/server/[slug]/page.tsx` (If exists, else [NEW])
- **Dynamic Routing & Target Metadata:** Implement `generateMetadata` to output optimized titles. Instead of "Hypixel", it will output `Hypixel - IP Address, Live Player Count, and Mods`.
- **Structured Data:** Inject `<script type="application/ld+json">` with `SoftwareApplication` or `Organization` schema to dominate SERPs with Rich Snippets (showing ratings, versions, and player counts directly in Google Search).

### Micro-Interactions

- Apply snapping hover effects (`duration-75` or `duration-150`).
- Ensure active states on the Server Cards and Tags translate down-right (`translate-x-[2px] translate-y-[2px]`) to mimic a mechanical press.

## Open Questions

> [!WARNING]
> 1. **Data Source:** For this UI sprint, should we use realistic mock data for the "Trending Servers" block, or connect it directly to an existing `GET /api/v1/servers` endpoint right away?
> 2. **Iconography:** Do we have custom pixel-art icons for "Ping", "Version", and "Mods" in `@firstspawn/ui`, or should I use Lucide-react icons wrapper in a retro style?

## Verification Plan

### Automated Tests
- Type checking (`pnpm typecheck`) to ensure Props match across new components.
- Ensure the JSON-LD schema generated conforms precisely to Google's structured data expectations for `SoftwareApplication`.

### Manual Verification
- Render the page locally and visually check layout against the 4px/8px grid pixel-retro requirement.
- Verify that live player counters correctly pulse (glowing green).
- Verify that clicking a server card initiates a route to the dynamic `/en/server/[slug]` URL.
