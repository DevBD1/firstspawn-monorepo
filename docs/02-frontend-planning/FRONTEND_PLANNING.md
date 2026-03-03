# Phase 2: Frontend Planning - FirstSpawn

**Status:** ✅ Architecture Defined  
**Date:** 2026-02-20  
**Framework:** Next.js 16 (App Router)

---

## 1. Architecture Decisions

### 1.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 16 App Router | Already in use, server components for performance |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS v4 | Already configured, rapid development |
| **Animation** | Framer Motion | Already in use, excellent React integration |
| **Icons** | Lucide React | Already in use, consistent iconography |
| **State Management** | Zustand + React Query | Simple, powerful, excellent for server state |
| **Forms** | React Hook Form + Zod | Performance + validation |
| **Components** | shadcn/ui + custom | Headless, customizable, pixel-art theme |

### 1.2 State Management Strategy

```typescript
// Global State (Zustand) - Client-only state
interface AppState {
  // UI State
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  
  // Auth State (hydrated from server)
  user: User | null;
  isAuthenticated: boolean;
  
  // Feature Flags
  features: Record<string, boolean>;
}

// Server State (React Query/TanStack Query)
// - Server listings
// - User profiles  
// - Reviews
// - Search results
// - Favorites
```

**Why this combination?**
- **Zustand:** Simple, no boilerplate, perfect for UI state
- **React Query:** Caching, background updates, optimistic updates for server data
- No Redux needed - too much boilerplate for this scope

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
app/                          # Next.js App Router
├── [lang]/                   # i18n routes (en, tr, de, ru, es, fr)
│   ├── layout.tsx            # Root layout with fonts, providers
│   ├── page.tsx              # Landing page (existing)
│   ├── servers/
│   │   ├── page.tsx          # Server discovery grid
│   │   └── [slug]/
│   │       └── page.tsx      # Server detail page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx      # Login page
│   │   └── register/
│   │       └── page.tsx      # Registration page
│   ├── dashboard/
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── page.tsx          # User dashboard home
│   │   ├── servers/
│   │   │   └── page.tsx      # My servers (owner view)
│   │   ├── reviews/
│   │   │   └── page.tsx      # My reviews
│   │   └── favorites/
│   │       └── page.tsx      # My favorites
│   └── api/                  # API routes (if needed)
│
components/
├── ui/                       # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
│
├── pixel/                    # Custom pixel-art components
│   ├── PixelButton.tsx       # (existing)
│   ├── PixelCard.tsx         # Pixel-styled card
│   ├── PixelInput.tsx        # Pixel-styled input
│   ├── PixelBadge.tsx        # Pixel-styled badge
│   └── PixelProgress.tsx     # Pixel progress bar
│
├── layout/                   # Layout components
│   ├── Navbar.tsx            # (existing, needs expansion)
│   ├── Footer.tsx            # (existing)
│   ├── Sidebar.tsx           # Dashboard sidebar
│   ├── CookieConsent.tsx     # (existing)
│   └── LocaleSwitcher.tsx    # (existing)
│
├── server/                   # Server-related components
│   ├── ServerCard.tsx        # Server grid item
│   ├── ServerGrid.tsx        # Server grid layout
│   ├── ServerFilters.tsx     # Filter sidebar/overlay
│   ├── ServerStats.tsx       # Stats display
│   ├── ServerTags.tsx        # Tag display
│   └── ServerVerification.tsx # Verification badge
│
├── review/                   # Review components
│   ├── ReviewCard.tsx        # Single review display
│   ├── ReviewList.tsx        # Review list with pagination
│   ├── ReviewForm.tsx        # Write review form
│   ├── StarRating.tsx        # Star rating input/display
│   └── VerifiedBadge.tsx     # Verified playtime badge
│
├── auth/                     # Auth components
│   ├── LoginForm.tsx         # Login form
│   ├── RegisterForm.tsx      # Registration form
│   ├── OAuthButtons.tsx      # Discord/Google buttons
│   └── UserMenu.tsx          # User dropdown menu
│
├── search/                   # Search components
│   ├── SearchBar.tsx         # Main search input
│   ├── SearchSuggestions.tsx # Autocomplete dropdown
│   └── FilterChips.tsx       # Active filter display
│
├── captcha/                  # (existing)
│   └── NewsletterCaptcha.tsx
│
├── landing/                  # (existing)
│   └── LandingPage.tsx
│
└── providers/                # Context providers
    ├── QueryProvider.tsx     # React Query provider
    ├── AuthProvider.tsx      # Auth context
    └── ThemeProvider.tsx     # Theme context (future)

hooks/                        # Custom hooks
├── useAuth.ts               # Auth state and methods
├── useServer.ts             # Server data fetching
├── useServers.ts            # Servers list fetching
├── useReviews.ts            # Reviews fetching
├── useFavorites.ts          # Favorites management
├── useSearch.ts             # Search logic
└── useDebounce.ts           # Debounce utility

lib/                         # Utilities and config
├── i18n-config.ts           # (existing)
├── get-dictionary.ts        # (existing)
├── dictionaries/            # (existing)
│   ├── en.json
│   ├── tr.json
│   └── ...
├── api-client.ts            # API client configuration
├── utils.ts                 # Utility functions
└── constants.ts             # App constants

stores/                      # Zustand stores
├── auth-store.ts            # Auth state
├── ui-store.ts              # UI state
└── search-store.ts          # Search state

types/                       # TypeScript types
├── user.ts                  # User types
├── server.ts                # Server types
├── review.ts                # Review types
└── api.ts                   # API response types
```

---

## 3. Page Specifications

### 3.1 Public Pages

#### Home (`/[lang]/`)
**Status:** ✅ Implemented (landing page)  
**Needs:** Connection to server discovery

#### Server Discovery (`/[lang]/servers`)
**Layout:** Sidebar filters + Main grid

**Components:**
- SearchBar (top, sticky)
- ServerFilters (sidebar: tags, region, players, version)
- ServerGrid (responsive grid)
- Pagination or Infinite Scroll

**Features:**
- URL-based filters (`?tags=pve,survival&region=eu`)
- Debounced search
- Sort options (rating, players, newest)

#### Server Detail (`/[lang]/servers/[slug]`)
**Layout:** Hero + Stats + Content + Reviews

**Sections:**
1. **Hero:** Banner, logo, name, join button
2. **Quick Stats:** Online status, player count, uptime, rating
3. **About:** Description, tags, links
4. **Verification Status:** Plugin verified indicator
5. **Reviews:** Review list with filters
6. **Similar Servers:** Recommendations

### 3.2 Auth Pages

#### Login (`/[lang]/auth/login`)
- Email/password form
- OAuth buttons (Discord, Google)
- "Forgot password" link
- "Create account" link

#### Register (`/[lang]/auth/register`)
- Email, username, password fields
- Terms acceptance
- OAuth alternatives

### 3.3 Dashboard Pages (Protected)

#### Dashboard Home (`/[lang]/dashboard`)
- User stats (reputation, badges)
- Recent activity
- Quick actions

#### My Servers (`/[lang]/dashboard/servers`)
- List of owned servers
- Add new server button
- Server management actions
- Verification status

#### My Reviews (`/[lang]/dashboard/reviews`)
- Reviews left by user
- Edit/delete actions

#### My Favorites (`/[lang]/dashboard/favorites`)
- Saved servers
- Quick access to server pages

---

## 4. Data Fetching Strategy

### 4.1 Server Components (Default)

Use for:
- Initial page loads
- SEO-critical content
- Static/pre-rendered data

```typescript
// app/[lang]/servers/page.tsx
import { getServers } from '@/lib/api';

export default async function ServersPage({ searchParams }) {
  const servers = await getServers(searchParams);
  return <ServerGrid servers={servers} />;
}
```

### 4.2 Client Components with React Query

Use for:
- Interactive filters
- Real-time updates
- User-specific data

```typescript
'use client';
import { useServers } from '@/hooks/useServers';

export function ServerGridClient() {
  const { data, isLoading, error } = useServers();
  // Handle loading, error, render
}
```

### 4.3 Server Actions

Use for:
- Form submissions
- Mutations
- Actions that need to update cache

```typescript
// app/actions/servers.ts
'use server';

export async function createServer(formData: FormData) {
  // Validate, create, revalidate
}
```

---

## 5. Routing & Navigation

### 5.1 Route Structure

```
Public Routes:
  /[lang]/                    # Landing
  /[lang]/servers             # Server discovery
  /[lang]/servers/[slug]      # Server detail
  /[lang]/auth/login          # Login
  /[lang]/auth/register       # Register

Protected Routes (require auth):
  /[lang]/dashboard           # Dashboard home
  /[lang]/dashboard/servers   # My servers
  /[lang]/dashboard/reviews   # My reviews
  /[lang]/dashboard/favorites # My favorites
  /[lang]/dashboard/settings  # Account settings

API Routes (if needed):
  /api/webhooks/...           # External service webhooks
```

### 5.2 Navigation Structure

**Main Navbar:**
- Logo → Home
- Discover → Servers list
- My Loot → Dashboard (if logged in)
- Auth buttons OR UserMenu

**Dashboard Sidebar:**
- Overview
- My Servers
- My Reviews
- My Favorites
- Settings
- Logout

---

## 6. Component Library Strategy

### 6.1 shadcn/ui Integration

**Install base components:**
```bash
npx shadcn add button card input dialog dropdown-menu
npx shadcn add avatar badge separator skeleton
npx shadcn add tabs textarea select
```

**Customize for pixel-art theme:**
- Override border-radius to be square or minimal
- Add pixel-style shadows
- Use retro color palette

### 6.2 Custom Pixel Components

Extend shadcn components with pixel styling:

```typescript
// components/pixel/PixelButton.tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends React.ComponentProps<typeof Button> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function PixelButton({ className, variant, ...props }: PixelButtonProps) {
  return (
    <Button
      className={cn(
        'rounded-none border-2 border-b-4 active:border-b-2 active:translate-y-0.5',
        variant === 'primary' && 'border-[#FFD700] bg-[#FFD700] text-black',
        className
      )}
      {...props}
    />
  );
}
```

---

## 7. Performance Considerations

### 7.1 Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Code Splitting** | Dynamic imports for heavy components |
| **Image Optimization** | Next.js Image component with R2/CDN |
| **Font Optimization** | next/font for Google Fonts |
| **Caching** | React Query + Next.js fetch caching |
| **Prefetching** | Link prefetch for critical pages |

### 7.2 Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTFB | < 600ms |

---

## 8. Error Handling

### 8.1 Error Boundaries

```typescript
// app/[lang]/error.tsx
'use client';

export default function ErrorBoundary({ error, reset }) {
  return (
    <div className="pixel-error">
      <h2>Something went wrong!</h2>
      <PixelButton onClick={reset}>Try again</PixelButton>
    </div>
  );
}
```

### 8.2 Loading States

```typescript
// app/[lang]/servers/loading.tsx
import { ServerGridSkeleton } from '@/components/skeletons';

export default function Loading() {
  return <ServerGridSkeleton />;
}
```

---

## 9. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Set up shadcn/ui
2. Create pixel-art component variants
3. Set up React Query and Zustand
4. Create type definitions

### Phase 2: Public Pages (Week 3-4)
1. Server discovery page
2. Server detail page
3. Search and filters
4. Server card components

### Phase 3: Auth & Dashboard (Week 5-6)
1. Auth pages and forms
2. Protected route middleware
3. Dashboard layout
4. User-specific pages

### Phase 4: Polish (Week 7-8)
1. Error boundaries and loading states
2. Animations and transitions
3. Responsive design
4. Performance optimization

---

## 10. Dependencies to Add

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "date-fns": "^3.x",
    "clsx": "^2.x"
  }
}
```

---

## Related Documents

- [Product Planning](../01-product/PRODUCT_PLANNING.md)
- [Frontend Design](../03-frontend-design/FRONTEND_DESIGN.md)
- [Database Design](../04-database-design/DATABASE_DESIGN.md)
- [Webservices](../05-webservices/WEBSERVICES.md)
- [Backend Architecture](../06-backend/BACKEND_ARCHITECTURE.md)
