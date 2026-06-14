import { headers } from "next/headers";
import LostChunk from "@/components/not-found/LostChunk";

/**
 * Not-found boundary for the entire `[lang]` segment — catches both unmatched
 * URLs (via the `[...notFound]` catch-all that forwards to `notFound()`) and
 * explicit `notFound()` calls (e.g. an unknown server slug).
 *
 * Must stay a Server Component with no client children: in Next.js 16 a
 * not-found boundary at the root segment that contains a client component is
 * silently ignored and the built-in default 404 renders instead. Locale is
 * read from the `x-pathname` header the proxy forwards (not-found files get no
 * route params).
 */
export default async function NotFound() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  return <LostChunk pathname={pathname} />;
}
