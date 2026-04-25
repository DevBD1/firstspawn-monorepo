"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import {
  ShieldCheck,
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
import { PixelButton } from "@firstspawn/ui";

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
    <div className="border-b border-gray-800 pb-4 md:border-none md:pb-0">
      <button
        onClick={() => onToggle(id)}
        className="group flex w-full items-center justify-between gap-2 py-2 md:cursor-default md:justify-start md:py-0"
      >
        <h3 className="font-display text-xs uppercase text-white transition-colors group-hover:text-accent-cyan">
          {title}
        </h3>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 md:hidden ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`${isOpen ? "block" : "hidden"} mt-4 transition-all duration-200 md:mt-6 md:block`}
      >
        <ul className="space-y-3 text-left font-ui text-xl">{children}</ul>
      </div>
    </div>
  );
}

export default function Footer({ dictionary }: FooterProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

  return (
    <footer className="relative overflow-hidden border-t-8 border-footer-border bg-footer-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(var(--footer-grid) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 hidden gap-8 border-b-4 border-gray-800 pb-12 md:grid md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-xl leading-relaxed text-white md:text-2xl">
              {dictionary.footer.cta.title}
              <br />
              <span className="text-accent-cyan">{dictionary.footer.cta.titleHighlight}</span>
            </h2>
            <p className="mb-6 max-w-md font-ui text-xl text-gray-400">
              {dictionary.footer.cta.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <PixelButton disabled className="cursor-not-allowed opacity-60">
                {dictionary.footer.cta.getStarted}
              </PixelButton>
              <PixelButton variant="outline" disabled className="cursor-not-allowed opacity-60">
                {dictionary.footer.cta.owners}
              </PixelButton>
            </div>
          </div>

          <div className="flex flex-col items-start justify-center space-y-4 md:items-end">
            <div className="hidden w-full max-w-sm border-2 border-gray-700 bg-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] md:block">
              <div className="mb-2 flex items-center space-x-3">
                <ShieldCheck className="text-success" />
                <span className="font-display text-xs text-success">
                  {dictionary.footer.stats.title}
                </span>
              </div>
              <div className="space-y-2 font-ui text-lg text-gray-300">
                <div className="flex justify-between">
                  <span>{dictionary.footer.stats.fakeVotes}</span>
                  <span className="text-white">{dictionary.footer.stats.fakeVotesValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>{dictionary.footer.stats.uptime}</span>
                  <span className="text-white">{dictionary.footer.stats.uptimeValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>{dictionary.footer.stats.filters}</span>
                  <span className="text-accent-cyan">{dictionary.footer.stats.filtersValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-6 flex items-center">
              <Image
                src="/favicon.ico"
                alt={dictionary.footer.brand.name}
                width={32}
                height={32}
                className="mr-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
              <span className="font-display text-white">{dictionary.footer.brand.name}</span>
            </div>
            <p className="mb-6 max-w-xs font-ui text-lg text-gray-500">
              {dictionary.footer.brand.description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.platform}
                    href={link.href}
                    className="text-gray-400 transition-transform hover:-translate-y-1 hover:text-accent-cyan"
                    aria-label={link.platform}
                  >
                    <Icon size={24} />
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
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.platform.about}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.platform.trust}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.platform.badges}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
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
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.resources.help}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.resources.api}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.resources.community}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
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
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.legal.terms}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.legal.privacy}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.legal.cookie}
              </span>
            </li>
            <li>
              <span className="cursor-not-allowed text-gray-600">
                {dictionary.footer.columns.legal.acceptable}
              </span>
            </li>
          </FooterSection>
        </div>

        <div className="flex flex-col items-center justify-between border-t-4 border-gray-800 pt-8 font-ui text-lg text-gray-600 md:flex-row">
          <p>
            {dictionary.footer.bottom.copyright.replace(
              "{year}",
              new Date().getFullYear().toString()
            )}
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <div className="flex items-center space-x-2">
              <Activity size={16} />
              <span>{dictionary.footer.bottom.systemsNormal}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database size={16} />
              <span>{dictionary.footer.bottom.version}</span>
            </div>
            <a
              href={EXTERNAL_LINKS.founder}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center space-x-2 text-red-500 transition-transform hover:scale-110"
            >
              <Heart size={16} fill="currentColor" />
              <span>{dictionary.footer.bottom.crafted}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
