"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import type { Locale } from "@/lib/i18n-config";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import type { AuthCookieUser } from "@/lib/auth";
import { WLButton, Sigil } from "@firstspawn/ui";
import { useTheme } from "@/components/providers/ThemeProvider.client";
import LocaleSwitcher from "./LocaleSwitcher.client";

export interface NavbarProps {
  lang: Locale;
  isAuthenticated: boolean;
  dictionary: AppDictionary;
  user?: AuthCookieUser | null;
}

export default function Navbar({ lang, dictionary, isAuthenticated, user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname() || "";
  const { theme, toggleTheme } = useTheme();

  const currentPath = pathname.startsWith(`/${lang}`) ? pathname : `/${lang}`;
  const loginHref = `/${lang}/login?next=${encodeURIComponent(currentPath)}`;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeMobileIfOpen = () => {
    setIsOpen(false);
  };

  const isLinkActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (active: boolean) =>
    `font-body text-[13.5px] font-semibold whitespace-nowrap transition-all duration-120 border-b-2 py-1.5 px-0.5 min-h-[36px] inline-flex items-center ${
      active
        ? "border-primary text-foreground"
        : "border-transparent text-muted hover:text-foreground"
    }`;

  const renderNavLinks = (isMobile = false) => (
    <div
      className={`flex ${isMobile ? "flex-col items-stretch gap-5" : "flex-row items-center gap-4"}`}
    >
      <Link
        href={`/${lang}/discover`}
        className={
          isMobile
            ? "text-base font-bold text-foreground py-1"
            : linkClass(isLinkActive(`/${lang}/discover`))
        }
        onClick={closeMobileIfOpen}
      >
        {dictionary.nav.discover.toLowerCase()}
      </Link>

      <Link
        href={`/${lang}/console`}
        className={
          isMobile
            ? "text-base font-bold text-foreground py-1"
            : linkClass(isLinkActive(`/${lang}/console`))
        }
        onClick={closeMobileIfOpen}
      >
        {dictionary.nav.forOwners.toLowerCase()}
      </Link>
    </div>
  );

  return (
    <nav className="sticky top-0 z-[100] min-h-[64px] border-b border-border bg-background/92 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5">
        {/* Left section: Hamburger (mobile) + Brand Logo + Nav links (desktop) */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex flex-col gap-1.5 border border-border bg-bg-panel p-2 rounded-lg active:brightness-95 md:hidden cursor-pointer"
            aria-label={dictionary.nav.menuLabel}
            aria-expanded={isOpen}
          >
            <div
              className={`h-0.5 w-6 bg-foreground transition-all ${isOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <div
              className={`h-0.5 w-6 bg-foreground transition-all ${isOpen ? "opacity-0" : ""}`}
            />
            <div
              className={`h-0.5 w-6 bg-foreground transition-all ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>

          <Link
            href={`/${lang}`}
            className="group flex items-center gap-2.5"
            onClick={closeMobileIfOpen}
          >
            <Sigil size={22} color="var(--primary)" />
            <span className="font-display font-semibold text-sm tracking-wide text-foreground uppercase">
              FIRST<span className="text-primary">SPAWN</span>
            </span>
          </Link>

          {/* Left-aligned navigation links on desktop */}
          <div className="hidden md:flex items-center gap-4 ml-2">{renderNavLinks(false)}</div>
        </div>

        {/* Right section (desktop theme switcher + locale switcher + auth buttons) */}
        <div className="hidden items-center gap-3.5 md:flex">
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="inline-flex items-center justify-center font-body text-[13px] font-semibold text-muted bg-transparent border border-border rounded-full px-3.5 py-1.5 min-h-[36px] cursor-pointer transition-colors hover:text-foreground"
            suppressHydrationWarning
          >
            {theme === "dusk" ? "☾ Dusk" : "☀ Day"}
          </button>
          <LocaleSwitcher currentLocale={lang} />
          <div className="h-6 w-px bg-border mx-1" />
          {isAuthenticated ? (
            <form action={logoutAction}>
              <input type="hidden" name="lang" value={lang} />
              <WLButton type="submit" variant="danger" size="sm">
                {dictionary.nav.logOut}
              </WLButton>
            </form>
          ) : (
            <WLButton href={loginHref} variant="primary" size="sm">
              {dictionary.nav.signIn}
            </WLButton>
          )}
        </div>

        {/* Mobile quick info (brand name) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            className="inline-flex items-center justify-center font-body text-xs font-semibold text-muted bg-transparent border border-border rounded-full px-2.5 py-1 min-h-[30px] cursor-pointer transition-colors hover:text-foreground"
            suppressHydrationWarning
          >
            {theme === "dusk" ? "☾" : "☀"}
          </button>
          <LocaleSwitcher currentLocale={lang} />
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      <div
        className={`fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileIfOpen}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 z-[102] flex h-[100dvh] w-[80%] max-w-[300px] -translate-x-full flex-col border-r border-border bg-bg-panel transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border p-5">
          <div className="font-body text-xs font-bold uppercase tracking-wider text-muted">
            Menu
          </div>
          <button
            onClick={closeMobileIfOpen}
            className="flex h-8 w-8 items-center justify-center border border-border bg-secondary rounded-lg text-sm text-foreground active:brightness-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {renderNavLinks(true)}
          {isAuthenticated && user && !user.email_confirmed_at && (
            <div className="mt-6">
              <Link
                href={`/${lang}/activation?email=${encodeURIComponent(user.email)}`}
                onClick={closeMobileIfOpen}
                className="flex items-center justify-center border border-danger bg-danger/10 px-4 py-3 text-danger rounded-lg text-sm"
              >
                <span className="animate-pulse mr-2 font-bold">!</span> {dictionary.nav.verifyEmail}
              </Link>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-bg-panel p-6 flex flex-col gap-4">
          {isAuthenticated ? (
            <form action={logoutAction} className="w-full">
              <input type="hidden" name="lang" value={lang} />
              <WLButton type="submit" variant="danger" fullWidth>
                {dictionary.nav.logOut}
              </WLButton>
            </form>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <WLButton href={loginHref} variant="primary" fullWidth onClick={closeMobileIfOpen}>
                {dictionary.nav.signIn}
              </WLButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
