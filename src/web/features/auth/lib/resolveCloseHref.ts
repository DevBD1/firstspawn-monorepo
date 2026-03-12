export const resolveCloseHref = (lang: string, nextPath: string | undefined): string => {
  if (!nextPath || !nextPath.startsWith("/")) {
    return `/${lang}`;
  }

  if (nextPath.startsWith(`/${lang}`)) {
    return nextPath;
  }

  return `/${lang}`;
};
