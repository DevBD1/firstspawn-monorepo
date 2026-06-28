"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sigil } from "@firstspawn/ui";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import {
  Activity,
  Database,
  Heart,
  Twitch,
  Twitter,
  Github,
  Youtube,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { EXTERNAL_LINKS, SOCIAL_LINKS as SOCIAL_DATA } from "@/lib/links";
import { useApiHealth } from "@/components/providers/ApiHealthProvider.client";
import NewsletterCaptcha from "@/features/captcha/components/NewsletterCaptcha.client";
import NewsletterSignup from "@/features/landing/components/NewsletterSignup.client";
import { useNewsletterSignup } from "@/features/landing/hooks/useNewsletterSignup";

export interface FooterProps {
  dictionary: AppDictionary;
}

interface FooterSectionProps {
  children: ReactNode;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  title: string;
}

function FooterSection({ children, id, isOpen, onToggle, title }: FooterSectionProps) {
  return (
    <div className="border-b border-border pb-4 md:border-none md:pb-0">
      <button
        onClick={() => onToggle(id)}
        className="group flex w-full items-center justify-between gap-2 py-2 md:cursor-default md:justify-start md:py-0"
      >
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform duration-200 md:hidden ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`${isOpen ? "block" : "hidden"} mt-4 transition-all duration-200 md:mt-6 md:block`}
      >
        <ul className="space-y-3 text-left font-body text-xs font-medium">{children}</ul>
      </div>
    </div>
  );
}

export default function Footer({ dictionary }: FooterProps) {
  const pathname = usePathname();
  const { status: apiHealth } = useApiHealth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const lang = pathname?.split("/").filter(Boolean)[0] ?? "en";
  const {
    confirmEmailSent,
    email,
    isSubscribed,
    showCaptcha,
    statusMessage,
    closeCaptcha,
    handleSubscribe,
    handleVerifySuccess,
    setEmail,
  } = useNewsletterSignup(lang, dictionary);

  // Hide footer on Discover page to avoid bad UX with infinite scrolling
  if (pathname?.includes("/discover")) {
    return null;
  }

  const socialLinks = [
    { platform: "Discord", href: SOCIAL_DATA.discord, icon: MessageCircle },
    { platform: "Twitter", href: SOCIAL_DATA.twitter, icon: Twitter },
    { platform: "GitHub", href: SOCIAL_DATA.github, icon: Github },
    { platform: "YouTube", href: SOCIAL_DATA.youtube, icon: Youtube },
    { platform: "Twitch", href: SOCIAL_DATA.twitch, icon: Twitch },
  ];

  const toggleSection = (section: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  // Bind the status indicator to live API health. "unknown" (before the first
  // poll resolves) keeps the neutral "Systems Normal" look to avoid flicker.
  const systemStatus =
    apiHealth === "down"
      ? { label: dictionary.footer.bottom.systemsDown, className: "text-danger" }
      : apiHealth === "degraded"
        ? { label: dictionary.footer.bottom.systemsDegraded, className: "text-amber-500" }
        : { label: dictionary.footer.bottom.systemsNormal, className: "" };

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          id="newsletter"
          className="mb-16 grid gap-8 border-b border-border pb-12 md:grid-cols-2 md:items-start"
        >
          <div className="max-w-md text-left">
            <h2 className="mb-3 font-display text-xl leading-relaxed text-foreground md:text-2xl font-bold">
              {dictionary.footer.cta.title}
              <br />
              <span className="text-primary">{dictionary.footer.cta.titleHighlight}</span>
            </h2>
            <p className="max-w-md font-body text-sm text-muted">
              {dictionary.footer.cta.subtitle}
            </p>
          </div>

          <div className="w-full">
            <NewsletterSignup
              dictionary={dictionary}
              confirmEmailSent={confirmEmailSent}
              email={email}
              isSubscribed={isSubscribed}
              onEmailChange={setEmail}
              onSubmit={handleSubscribe}
              statusMessage={statusMessage}
            />
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2 text-left">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-panel">
                <Sigil size={20} color="var(--primary)" />
              </span>
              <span className="font-display font-bold text-foreground text-base tracking-wide">
                {dictionary.footer.brand.name}
              </span>
            </div>
            <p className="mb-6 max-w-xs font-body text-xs leading-relaxed text-muted">
              {dictionary.footer.brand.description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.platform}
                    href={link.href}
                    className="text-muted transition-transform hover:-translate-y-1 hover:text-foreground"
                    aria-label={link.platform}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          <FooterSection
            id="platform"
            title={dictionary.footer.columns.platform.title}
            onToggle={toggleSection}
            isOpen={Boolean(openSections.platform)}
          >
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.platform.about}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.platform.trust}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.platform.badges}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.platform.api}
              </span>
            </li>
          </FooterSection>

          <FooterSection
            id="resources"
            title={dictionary.footer.columns.resources.title}
            onToggle={toggleSection}
            isOpen={Boolean(openSections.resources)}
          >
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.resources.help}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.resources.api}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.resources.community}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.resources.partners}
              </span>
            </li>
          </FooterSection>

          <FooterSection
            id="legal"
            title={dictionary.footer.columns.legal.title}
            onToggle={toggleSection}
            isOpen={Boolean(openSections.legal)}
          >
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.legal.terms}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.legal.privacy}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.legal.cookie}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-muted">
                {dictionary.footer.columns.legal.acceptable}
              </span>
            </li>
          </FooterSection>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-border pt-8 font-body text-xs text-muted md:flex-row gap-4">
          <p>
            {dictionary.footer.bottom.copyright.replace(
              "{year}",
              new Date().getFullYear().toString()
            )}
          </p>
          <div className="flex flex-wrap space-x-6 justify-center">
            <div className={`flex items-center space-x-2 ${systemStatus.className}`}>
              <Activity size={14} />
              <span>{systemStatus.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database size={14} />
              <span>{dictionary.footer.bottom.version}</span>
            </div>
            <a
              href={EXTERNAL_LINKS.founder}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-1.5 text-danger transition-transform hover:scale-105"
            >
              <Heart size={14} fill="currentColor" />
              <span>{dictionary.footer.bottom.crafted}</span>
            </a>
          </div>
        </div>
      </div>
      <NewsletterCaptcha
        dictionary={dictionary}
        isOpen={showCaptcha}
        onClose={closeCaptcha}
        onVerify={handleVerifySuccess}
      />
    </footer>
  );
}
