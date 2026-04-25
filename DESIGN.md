# Design System: FirstSpawn (Refined)

## 1. Visual Theme & Atmosphere
**Vibe**: Technical, Mechanical, and Trustworthy Retro-Futurism.
FirstSpawn uses a "High-Contrast Terminal" aesthetic. It should feel like a premium game server dashboard from 1994—blocky, snappy, and deeply technical, but with modern performance and readability.

## 2. Color Palette & Semantic Roles
**CRITICAL:** Use Tailwind variables. Never hardcode hex values.

| Role | Descriptive Name | CSS Variable | Hex (Reference) | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | Deep Space Navy | `--background` | `#05070A` | Main canvas |
| **Surface** | Control Panel Navy | `--panel` | `#0F172A` | Cards, Modals, Sections |
| **Primary** | Retro Blue | `--primary` | `#3B82F6` | Primary actions, branding |
| **Secondary** | Power-On Green | `--success` | `#39FF14` | Active servers, "Online" status |
| **Danger** | Core Meltdown Red | `--danger` | `#FF3131` | Errors, "Offline" status |
| **Accent** | Warning Orange | `--fs-orange` | `#FF9500` | Notifications, alerts |
| **Accent** | Legendary Gold | `--fs-gold` | `#FFD700` | Premium features, high trust |
| **Text** | High-Vis White | `--foreground` | `#E0E6ED` | Main body text |
| **Text Muted** | Ghost Terminal Gray | `--muted` | `#64748B` | Secondary labels, descriptions |

## 3. Typography Rules
**Philosophy:** Hierarchy over decoration. Readability is mandatory.

*   **Display (Short Headlines/Hero):** `font-display` (Press Start 2P). **Rule:** Only use for text < 20 characters. Uppercase only.
*   **UI/Header (Primary Nav/H2-H4):** `font-ui` (VT323). High readability pixel font. Use for most headlines and buttons.
*   **Body (Content/Data):** `font-body` (JetBrains Mono). Standard monospaced font for all readable content, server logs, and descriptions.

## 4. Component Stylings
*   **The "Mechanical" Shadow:** No transparency. Use solid offsets.
    *   *Raised:* `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
    *   *Pressed:* `translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
*   **Borders:** Strict 2px or 4px solid black. Sharp 90-degree corners ONLY. No `rounded-*` classes allowed.
*   **Buttons (PixelButton):**
    *   Default: Primary background, black border, "Raised" shadow.
    *   Active: Snap to "Pressed" state instantly (`duration-0`).
*   **Cards (PixelCard):**
    *   Dark panel background with a 1px inset border of `--muted` to simulate a "bezel" effect.

## 5. Animation & Motion
*   **Philosophy:** Snappy, instantaneous, mechanical.
*   **Active States:** `duration-75` or `duration-0`. Transitions should feel like a physical switch clicking.
*   **The "Pulse" (Replacement for Blinking):** Use a `steps(2)` or `steps(4)` CSS animation for a "staccato" pulse. Avoid smooth fades.
*   **Loading:** Horizontal "bit-filling" progress bars or rotating `/ - \ |` ASCII-style spinners.

## 6. Grid & Spacing
*   **Base Unit:** 4px (The "Pixel"). All spacing must be multiples of 4 (Tailwind `p-1`, `m-2`, etc.).
*   **Gutter:** Use `gap-4` (16px) or `gap-8` (32px) to ensure blocky elements don't feel cluttered.

## 7. Do's and Don'ts
*   **DO** use uppercase and wide letter-spacing (`tracking-widest`) for labels.
*   **DON'T** use `opacity` for disabled states. Use a "Dithered" gray color or a strikethrough.
*   **DO** use bright accent colors (Cyan/Green) sparingly for maximum impact against the dark background.
*   **DON'T** use blur, gradients, or rounded corners. If it wouldn't work on a CRT monitor, it doesn't belong here.
