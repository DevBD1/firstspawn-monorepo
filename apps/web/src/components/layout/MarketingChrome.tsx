import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n-config";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import Navbar from "./Navbar.client";
import Footer from "./Footer.client";
import CookieConsent from "./CookieConsent.client";
import type { AuthCookieUser } from "@/lib/auth";

interface MarketingChromeProps {
  lang: Locale;
  dictionary: AppDictionary;
  isAuthenticated: boolean;
  user?: AuthCookieUser | null;
  children: ReactNode;
}

export default function MarketingChrome({
  lang,
  dictionary,
  isAuthenticated,
  user,
  children,
}: MarketingChromeProps) {
  return (
    <>
      <Navbar lang={lang} dictionary={dictionary} isAuthenticated={isAuthenticated} user={user} />
      <main className="flex-grow">{children}</main>
      <Footer dictionary={dictionary} />
      <CookieConsent lang={lang} dictionary={dictionary} />
    </>
  );
}
