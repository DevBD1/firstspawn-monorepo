# Phase 3: Frontend Design - FirstSpawn

**Status:** ✅ Design System Defined  
**Date:** 2026-02-20  
**Theme:** Pixel-Art Retro Gaming (Dark Mode Primary)

---

## 1. Design Philosophy

### 1.1 Core Principles

1. **Pixel-Perfect Aesthetic:** Every element should feel like it belongs in a retro game
2. **Information Density:** Gaming audiences expect information-rich interfaces
3. **Dark Mode First:** Optimize for dark gaming environments, light mode foundation for later
4. **Accessibility:** Retro doesn't mean inaccessible - maintain WCAG 2.1 AA compliance

### 1.2 Visual References

- **Games:** Stardew Valley, Terraria, Minecraft UI
- **Inspiration:** 90s CRT monitors, arcade machines, pixel art
- **Existing:** Your current landing page aesthetic

---

## 2. Color System

### 2.1 Primary Palette

```css
/* Core Brand Colors */
--color-gold: #FFD700;        /* Primary accent, CTAs */
--color-gold-dark: #DAA520;   /* Gold hover states */
--color-orange: #FF6B00;      /* Secondary accent, warnings */
--color-orange-dark: #CC5500; /* Orange hover states */

/* Functional Colors */
--color-cyan: #2EBCDA;        /* Info, links, highlights */
--color-cyan-dark: #1A8A9F;   /* Cyan borders, shadows */
--color-green: #4ADE80;       /* Success, online status */
--color-green-dark: #22C55E;  /* Success hover */
--color-red: #EF4444;         /* Error, offline status */
--color-red-dark: #DC2626;    /* Error hover */
--color-yellow: #FACC15;      /* Warning, attention */

/* Neutral Colors (Dark Mode - Primary) */
--color-bg-primary: #0B0B15;      /* Main background */
--color-bg-secondary: #1A1025;    /* Card backgrounds */
--color-bg-tertiary: #2D1B4E;     /* Elevated surfaces */
--color-surface: #0F161C;         /* Input backgrounds */
--color-surface-hover: #1A2633;   /* Hover states */

/* Text Colors */
--color-text-primary: #FFFFFF;
--color-text-secondary: #9CA3AF;
--color-text-muted: #6D8A99;
--color-text-disabled: #4B5563;
```

### 2.2 Color Usage Patterns

| Element | Color | Usage |
|---------|-------|-------|
| Primary Buttons | Gold (#FFD700) | Main CTAs, submit actions |
| Secondary Buttons | Cyan (#2EBCDA) | Secondary actions, links |
| Danger Buttons | Red (#EF4444) | Delete, remove, cancel |
| Success States | Green (#4ADE80) | Verified, online, complete |
| Borders | Cyan-dark (#1A8A9F) | Card borders, dividers |
| Accent Borders | Gold-dark (#DAA520) | Featured elements |

### 2.3 Light Mode Foundation (Future)

```css
/* Light Mode - Placeholder for future */
--color-bg-primary-light: #F8F9FA;
--color-bg-secondary-light: #FFFFFF;
--color-text-primary-light: #1A1A1A;
--color-text-secondary-light: #4B5563;
```

**Implementation:** Use CSS variables + data attribute toggle

---

## 3. Typography

### 3.1 Font Stack

```css
/* Already configured in layout.tsx */
--font-pixel: 'Press Start 2P', cursive;     /* Headers, CTAs */
--font-terminal: 'VT323', monospace;          /* Stats, code */
--font-body: 'Geist', system-ui, sans-serif;  /* Body text */
--font-mono: 'Geist Mono', monospace;         /* Technical text */
```

### 3.2 Type Scale

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | Press Start 2P | 32px | 400 | Page titles |
| H2 | Press Start 2P | 24px | 400 | Section headers |
| H3 | Press Start 2P | 18px | 400 | Card titles |
| H4 | Geist | 18px | 600 | Subsection headers |
| Body | Geist | 16px | 400 | Paragraphs |
| Body Small | Geist | 14px | 400 | Descriptions |
| Caption | VT323 | 14px | 400 | Labels, stats |
| Mono | Geist Mono | 14px | 400 | Code, timestamps |

### 3.3 Typography Patterns

**Pixel Font Guidelines:**
- Use sparingly (headings, buttons, labels)
- Never use for body text (hard to read at small sizes)
- Keep to 1-2 words when possible
- Use uppercase for consistency

**Terminal Font (VT323) Guidelines:**
- Great for stats, numbers, labels
- Use for "game-like" information display
- Perfect for player counts, uptime percentages

---

## 4. Spacing System

### 4.1 Base Unit

Base unit: **4px**

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 4.2 Spacing Patterns

| Context | Padding | Gap |
|---------|---------|-----|
| Cards | 16px-24px | - |
| Buttons | 12px 24px | - |
| Inputs | 12px 16px | - |
| Grid Items | - | 16px-24px |
| Section Spacing | - | 32px-48px |
| Container Padding | 16px (mobile) / 24px (tablet) / 32px (desktop) | - |

---

## 5. Component Specifications

### 5.1 Buttons

#### Primary Button (Gold)

```
┌─────────────────────────────┐
│  [  PRIMARY ACTION  ]       │
└─────────────────────────────┘
```

**Specs:**
- Background: #FFD700
- Text: #0F161C (dark for contrast)
- Border: 2px solid #DAA520 (darker gold)
- Border-bottom: 4px solid #DAA520 (3D effect)
- Border-radius: 0 (square corners)
- Font: Press Start 2P, 12px
- Padding: 12px 24px
- Text-transform: uppercase

**States:**
- Hover: Brightness 110%
- Active: Border-bottom 2px, translateY 2px (pressed effect)
- Disabled: Opacity 50%, cursor not-allowed

#### Secondary Button (Cyan)

- Background: transparent
- Border: 2px solid #2EBCDA
- Text: #2EBCDA
- Same 3D border effect

#### Danger Button (Red)

- Background: #EF4444
- Border: #DC2626
- Text: white

### 5.2 Cards

#### Server Card

```
┌──────────────────────────────┐
│  [BANNER IMAGE]              │
│                              │
├──────────────────────────────┤
│  [LOGO]  Server Name    ★4.5 │
│          PVE • Survival       │
│                              │
│  🟢 142/500   ⏱ 99.9%   ♥ 24 │
├──────────────────────────────┤
│  [    VIEW SERVER    ]       │
└──────────────────────────────┘
```

**Specs:**
- Background: #0F161C
- Border: 2px solid #1A8A9F
- Border-radius: 0
- Shadow: 4px 4px 0 rgba(26, 138, 159, 0.3)
- Hover: Border color → #2EBCDA, shadow expands

**Elements:**
- Banner: 16:9 aspect ratio, object-cover
- Logo: 48x48px, border 2px gold
- Tags: Small pill badges
- Stats: VT323 font, icon + number

### 5.3 Inputs

#### Text Input

```
┌──────────────────────────────┐
│  Enter server name...        │
└──────────────────────────────┘
```

**Specs:**
- Background: #0B131A (darker than surface)
- Border: 2px solid #1A8A9F
- Border-radius: 0
- Text: #FFFFFF
- Placeholder: #4B5563
- Padding: 12px 16px
- Font: Geist Mono, 14px

**Focus State:**
- Border: 2px solid #FFD700
- Box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2)

### 5.4 Badges

#### Tag Badge

```
┌───────────┐
│  SURVIVAL │
└───────────┘
```

**Specs:**
- Background: transparent
- Border: 1px solid current color
- Border-radius: 0
- Font: VT323, 14px
- Padding: 2px 8px
- Colors by category:
  - Gamemode: #2EBCDA (cyan)
  - Feature: #4ADE80 (green)
  - Region: #FFD700 (gold)

#### Verification Badge

```
┌───────────┐
│  ✓ VERIFIED │
└───────────┘
```

- Background: #4ADE80
- Text: #0F161C
- Font: Press Start 2P, 8px
- Shows on verified servers/reviews

### 5.5 Progress Bars

```
PROGRESS
┌──────────────────────────────┐
│████████████████░░░░░░░░░░░░░░│ 42%
└──────────────────────────────┘
```

**Specs:**
- Height: 16px
- Background: #1A2633
- Fill: Gradient #4ADE80 → #2EBCDA
- Border: 1px solid #2EBCDA
- Font: VT323, 12px, overlay or right

---

## 6. Page Designs

### 6.1 Server Discovery Page

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  FIRSTSPAWN    DISCOVER  [Search...]             [User ▼]   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────┐  │
│  │ FILTERS  │  │  Sort: [Popular ▼]  Grid / List        │  │
│  │          │  ├─────────────────────────────────────────┤  │
│  │ Gamemode │  │  ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │ ☑ PvE    │  │  │Server 1│ │Server 2│ │Server 3│       │  │
│  │ ☐ PvP    │  │  │        │ │        │ │        │       │  │
│  │ ☑ RP     │  │  └────────┘ └────────┘ └────────┘       │  │
│  │          │  │  ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │ Region   │  │  │Server 4│ │Server 5│ │Server 6│       │  │
│  │ ☑ EU     │  │  │        │ │        │ │        │       │  │
│  │ ☐ US     │  │  └────────┘ └────────┘ └────────┘       │  │
│  │          │  │                                         │  │
│  │ Players  │  │  [    <  1  2  3  ...  10  >    ]      │  │
│  │ [━●━━━━] │  │                                         │  │
│  └──────────┘  └─────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

#### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Filters in drawer/modal, 1 column grid |
| Tablet (640-1024px) | Collapsible sidebar, 2 column grid |
| Desktop (>1024px) | Fixed sidebar, 3 column grid |
| Large (>1280px) | Fixed sidebar, 4 column grid |

### 6.2 Server Detail Page

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [BANNER IMAGE - Full Width, 300px height]                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────┐                                                     │
│  │LOGO│  Server Name                    [   JOIN   ]        │
│  └────┘  ★★★★☆ 4.2 (128 reviews)       [  ♥ SAVE  ]        │
│          PVE • Survival • RPG                               │
│          ✓ Verified Plugin                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │   🟢 ONLINE    │ │  ⏱ 99.9% UPTIME│ │  👥 142/500    │  │
│  │    142 now     │ │   Last 30 days │ │    Players     │  │
│  └────────────────┘ └────────────────┘ └────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ABOUT                                                       │
│  Lorem ipsum dolor sit amet...                              │
│                                                              │
│  LINKS: [Website] [Discord] [Wiki]                          │
├─────────────────────────────────────────────────────────────┤
│  REVIEWS (128)                    [Write a Review]          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ★★★★★ Alex - 2 days ago                            │   │
│  │ ✓ Verified (12h playtime)                          │   │
│  │ Great server, amazing community!                   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ★★★★☆ Jordan - 1 week ago                          │   │
│  │ Good but needs more events                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Auth Pages

#### Login Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │   FIRSTSPAWN LOGO   │                  │
│                    │                     │                  │
│                    │      WELCOME        │                  │
│                    │      BACK!          │                  │
│                    └─────────────────────┘                  │
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │ Email               │                  │
│                    ├─────────────────────┤                  │
│                    │ Password            │                  │
│                    ├─────────────────────┤                  │
│                    │  [    SIGN IN    ]  │                  │
│                    └─────────────────────┘                  │
│                                                             │
│                    ─── or continue with ───                 │
│                                                             │
│                    [Discord] [Google]                       │
│                                                             │
│                    Don't have an account?                   │
│                    [Create one]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Style:**
- Centered card with max-width 400px
- Pixel border effect
- Social buttons: Brand colors with pixel styling

### 6.4 Dashboard

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  FIRSTSPAWN                                    [User ▼]     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  OVERVIEW│  DASHBOARD                                       │
│  ────────│                                                  │
│          │  ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  My      │  │ Reputation │ │   Badges   │ │  Reviews   │   │
│  Servers │  │    1,240   │ │     12     │ │     8      │   │
│          │  └────────────┘ └────────────┘ └────────────┘   │
│  My      │                                                  │
│  Reviews │  RECENT ACTIVITY                                 │
│          │  ┌───────────────────────────────────────────┐  │
│  My      │  │ ✓ Review posted to "Epic Hytale Server"  │  │
│  Favorites│  │ ✓ Earned "First Review" badge            │  │
│          │  │ ✓ Server "MyServer" verified!            │  │
│  Settings│  └───────────────────────────────────────────┘  │
│          │                                                  │
│  [Logout]│                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 7. Animations & Interactions

### 7.1 Micro-interactions

| Element | Interaction | Animation |
|---------|-------------|-----------|
| Buttons | Hover | Scale 1.02, brightness increase |
| Buttons | Click | translateY(2px), border-bottom reduces |
| Cards | Hover | Border color brighten, shadow expand |
| Links | Hover | Color shift to gold, underline appears |
| Inputs | Focus | Border gold, subtle glow |
| Badges | Hover | Scale 1.05 |

### 7.2 Page Transitions

```typescript
// Framer Motion page transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1]
};
```

### 7.3 Loading States

#### Skeleton Screens

```
┌──────────────────────────────┐
│  ████████████████████████    │  ← Banner placeholder
│  ████████████████████████    │
├──────────────────────────────┤
│  ████  ████████████████      │  ← Logo + Title
│       ████████████           │  ← Description lines
│       ████████████████       │
└──────────────────────────────┘
```

**Animation:**
- Shimmer effect from left to right
- Background gradient animation
- Duration: 1.5s infinite

#### Progress Animation

```typescript
// For the progress bar shimmer
const progressShimmer = {
  backgroundPosition: ['0% 0%', '100% 0%'],
  transition: { duration: 2, repeat: Infinity, ease: 'linear' }
};
```

---

## 8. Responsive Breakpoints

| Name | Width | Columns (Servers) | Layout Changes |
|------|-------|-------------------|----------------|
| Mobile | < 640px | 1 | Stacked layout, drawer filters |
| Tablet | 640-1024px | 2 | Collapsible sidebar |
| Desktop | 1024-1280px | 3 | Fixed sidebar |
| Large | > 1280px | 4 | Wider container |

---

## 9. Accessibility Considerations

### 9.1 Color Contrast

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Primary Text | #FFFFFF | #0B0B15 | 16.8:1 ✅ |
| Secondary Text | #9CA3AF | #0B0B15 | 7.2:1 ✅ |
| Gold Buttons | #0F161C | #FFD700 | 12.4:1 ✅ |
| Cyan Borders | #2EBCDA | #0B0B15 | 8.9:1 ✅ |

### 9.2 Focus Indicators

- All interactive elements: 2px gold outline
- Offset: 2px from element
- Visible in both light/dark modes

### 9.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Assets Needed

### 10.1 Icons

| Icon | Source | Notes |
|------|--------|-------|
| Gamepad | Lucide | Navigation |
| Server | Lucide | Server indicators |
| Users | Lucide | Player count |
| Clock | Lucide | Uptime |
| Star | Lucide | Ratings |
| Heart | Lucide | Favorites |
| Shield | Lucide | Verification |
| Trophy | Lucide | Badges |

### 10.2 Images

| Asset | Type | Usage |
|-------|------|-------|
| Default Server Banner | JPG/PNG | Fallback for servers |
| Default Server Logo | PNG | Fallback for servers |
| Achievement Badges | SVG | User/Server badges |
| Background Patterns | PNG/SVG | Subtle texture |

---

## Related Documents

- [Product Planning](../01-product/PRODUCT_PLANNING.md)
- [Frontend Planning](../02-frontend-planning/FRONTEND_PLANNING.md)
- [Database Design](../04-database-design/DATABASE_DESIGN.md)
- [Webservices](../05-webservices/WEBSERVICES.md)
- [Backend Architecture](../06-backend/BACKEND_ARCHITECTURE.md)
