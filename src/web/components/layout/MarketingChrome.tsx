import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n-config";
import Navbar from "./Navbar.client";
import Footer from "./Footer.client";
import CookieConsent from "./CookieConsent.client";
import type { AuthCookieUser } from "@/lib/auth";

export interface MarketingChromeDictionary {
  common: { brand: string; tagline: string };
  nav: {
    discover: string;
    myLoot: string;
    console: string;
    register: string;
    logIn: string;
    logOut: string;
  };
  cookie_consent: {
    message: string;
    accept: string;
    decline: string;
  };
  footer: {
    cta: {
      title: string;
      titleHighlight: string;
      subtitle: string;
      getStarted: string;
      owners: string;
    };
    stats: {
      title: string;
      fakeVotes: string;
      fakeVotesValue: string;
      uptime: string;
      uptimeValue: string;
      filters: string;
      filtersValue: string;
    };
    brand: {
      name: string;
      description: string;
    };
    columns: {
      platform: {
        title: string;
        about: string;
        trust: string;
        badges: string;
        api: string;
      };
      resources: {
        title: string;
        help: string;
        api: string;
        community: string;
        partners: string;
      };
      legal: {
        title: string;
        terms: string;
        privacy: string;
        cookie: string;
        acceptable: string;
      };
    };
    bottom: {
      copyright: string;
      systemsNormal: string;
      version: string;
      crafted: string;
    };
  };
}

interface MarketingChromeProps {
  lang: Locale;
  dictionary: MarketingChromeDictionary;
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
      <CookieConsent dictionary={dictionary} />
    </>
  );
}
