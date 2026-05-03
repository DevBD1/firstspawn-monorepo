"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { Locale } from "@/lib/i18n-config";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import type { AuthCookieUser } from "@/lib/auth";
import { PixelButton } from "@firstspawn/ui";
import LocaleSwitcher from "./LocaleSwitcher.client";

export interface NavbarProps {
  lang: Locale;
  isAuthenticated: boolean;
  dictionary: AppDictionary;
  user?: AuthCookieUser | null;
}

export default function Navbar({ lang, dictionary, isAuthenticated, user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const currentPath = pathname && pathname.startsWith(`/${lang}`) ? pathname : `/${lang}`;
  const registerHref = `/${lang}/signup?next=${encodeURIComponent(currentPath)}`;
  const loginHref = `/${lang}/login?next=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navButtonClass = (isMobile: boolean) => (isMobile ? "w-full py-4 text-xs" : "");

  const closeMobileIfOpen = (isMobile: boolean) => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <div className={`flex ${isMobile ? "flex-col gap-8" : "flex-row gap-2"} items-center w-full`}>
      <PixelButton
        href={`/${lang}/discover`}
        variant="secondary"
        className={navButtonClass(isMobile)}
        onClick={() => closeMobileIfOpen(isMobile)}
      >
        {dictionary.nav.discover}
      </PixelButton>

      {isAuthenticated ? (
        <>
          {user && !user.email_confirmed_at && (
            <Link
              href={`/${lang}/activation?email=${encodeURIComponent(user.email)}`}
              onClick={() => closeMobileIfOpen(isMobile)}
              className={`flex items-center justify-center border-2 border-red-500 bg-red-950/30 px-3 py-1 text-red-400 font-ui text-xs hover:bg-red-900/50 transition-colors ${
                isMobile ? "w-full py-3" : "h-8"
              }`}
              title={dictionary.nav.verifyEmailTitle}
            >
              <span className="animate-pulse mr-2">!</span> {dictionary.nav.verifyEmail}
            </Link>
          )}
          <PixelButton
            href={`/${lang}/loot`}
            variant="secondary"
            className={navButtonClass(isMobile)}
            onClick={() => closeMobileIfOpen(isMobile)}
          >
            {dictionary.nav.myLoot}
          </PixelButton>
          <PixelButton
            href={`/${lang}/console`}
            variant="success"
            className={navButtonClass(isMobile)}
            onClick={() => closeMobileIfOpen(isMobile)}
          >
            {dictionary.nav.console}
          </PixelButton>
          <form action={logoutAction} className={isMobile ? "w-full" : ""}>
            <input type="hidden" name="lang" value={lang} />
            <PixelButton
              type="submit"
              variant="danger"
              className={navButtonClass(isMobile)}
              onClick={() => closeMobileIfOpen(isMobile)}
            >
              {dictionary.nav.logOut}
            </PixelButton>
          </form>
        </>
      ) : (
        <>
          <PixelButton
            href={registerHref}
            variant="success"
            className={navButtonClass(isMobile)}
            onClick={() => closeMobileIfOpen(isMobile)}
          >
            {dictionary.nav.signUp}
          </PixelButton>
          <PixelButton
            href={loginHref}
            variant="primary"
            className={navButtonClass(isMobile)}
            onClick={() => closeMobileIfOpen(isMobile)}
          >
            {dictionary.nav.logIn}
          </PixelButton>
        </>
      )}
    </div>
  );

  return (
    <nav className="sticky top-0 z-[100] min-h-[80px] border-b-4 border-black bg-bg-panel/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex flex-col gap-1.5 border-2 border-black bg-bg-panel p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none md:hidden"
            aria-label={dictionary.nav.menuLabel}
            aria-expanded={isOpen}
          >
            <div
              className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <div className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "opacity-0" : ""}`} />
            <div
              className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>

          <Link
            href={`/${lang}`}
            className="group flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-primary text-xl text-white font-display shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none">
              F
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg tracking-tighter text-white">
                {dictionary.common.brand}
              </h1>
              <p className="font-ui text-[10px] uppercase tracking-wide text-gray-500">
                {dictionary.common.tagline}
              </p>
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {renderNavLinks()}
          <div className="mx-2 h-8 w-1 bg-black" />
          <LocaleSwitcher currentLocale={lang} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="font-display text-[8px] text-zinc-200 sm:hidden">
            {dictionary.common.brand}
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[101] bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 z-[102] flex h-[100dvh] w-[85%] max-w-[320px] -translate-x-full flex-col border-r-4 border-black bg-bg-panel transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b-4 border-black bg-bg-panel p-5">
          <div className="font-ui text-sm font-semibold uppercase tracking-wider text-primary">
            Menu
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-10 w-10 items-center justify-center border-2 border-black bg-secondary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span className="font-display text-sm text-white">X</span>
          </button>
        </div>

        <div className="min-h-0 flex-grow overflow-y-auto p-6">
          <div className="pr-1 pb-4">{renderNavLinks(true)}</div>
        </div>

        <div className="flex-shrink-0 border-t-4 border-black bg-bg-panel p-6">
          <p className="mb-4 font-ui text-[10px] uppercase tracking-wide text-gray-500">
            {dictionary.nav.languageMenuLabel}
          </p>
          <LocaleSwitcher currentLocale={lang} variant="inline" />
        </div>
      </div>
    </nav>
  );
}
