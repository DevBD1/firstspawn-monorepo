import { notFound } from "next/navigation";

/**
 * Catch-all for unmatched localized routes.
 *
 * Next.js renders a nested `not-found.tsx` only for explicit `notFound()`
 * calls within its segment — it does NOT catch unmatched URLs. Since this app
 * has no root `app/not-found.tsx` (html/body live in `[lang]/layout.tsx`),
 * a typo like `/{lang}/does-not-exist` would otherwise fall through to the
 * built-in Next.js default 404 instead of our custom "Lost Chunk" page.
 *
 * This catch-all takes the lowest routing precedence, so real routes
 * (discover, server/[slug], …) still win; only otherwise-unmatched paths
 * reach here and get forwarded to `[lang]/not-found.tsx`.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
