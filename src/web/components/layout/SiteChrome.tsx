"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import CookieConsent from "./CookieConsent";
import Footer from "./Footer";
import Navbar from "./Navbar";

type NavbarDictionary = ComponentProps<typeof Navbar>["dictionary"];
type FooterDictionary = ComponentProps<typeof Footer>["dictionary"];
type CookieDictionary = ComponentProps<typeof CookieConsent>["dictionary"];
type ChromeDictionary = NavbarDictionary & FooterDictionary & CookieDictionary;
type ChromeLang = ComponentProps<typeof Navbar>["lang"];

interface SiteChromeProps {
  lang: ChromeLang;
  dictionary: ChromeDictionary;
  isAuthenticated: boolean;
  children: ReactNode;
}

const AUTH_ROUTES = new Set(["login", "signup", "register"]);

const isAuthRoute = (pathname: string | null): boolean => {
  if (!pathname) {
    return false;
  }

  const segments = pathname.split("/").filter(Boolean);
  return AUTH_ROUTES.has(segments[1] || "");
};

export default function SiteChrome({
  lang,
  dictionary,
  isAuthenticated,
  children,
}: SiteChromeProps) {
  const pathname = usePathname();
  const hideGlobalChrome = isAuthRoute(pathname);

  return (
    <>
      {hideGlobalChrome ? null : (
        <Navbar
          lang={lang}
          dictionary={dictionary}
          isAuthenticated={isAuthenticated}
        />
      )}
      <main className="flex-grow">{children}</main>
      {hideGlobalChrome ? null : <Footer lang={lang} dictionary={dictionary} />}
      {hideGlobalChrome ? null : <CookieConsent dictionary={dictionary} />}
    </>
  );
}
