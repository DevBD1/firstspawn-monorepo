const FALLBACK_CLOSE_SEGMENTS = new Set(["console", "loot", "login", "signup"]);

export const resolveCloseHref = (lang: string, nextPath: string | undefined): string => {
  if (!nextPath || !nextPath.startsWith("/")) {
    return `/${lang}`;
  }

  const nextUrl = new URL(nextPath, "https://firstspawn.local");
  if (!nextUrl.pathname.startsWith(`/${lang}`)) {
    return `/${lang}`;
  }

  const [, pathLang, firstSegment] = nextUrl.pathname.split("/");
  if (pathLang !== lang || (firstSegment && FALLBACK_CLOSE_SEGMENTS.has(firstSegment))) {
    return `/${lang}`;
  }

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
};
