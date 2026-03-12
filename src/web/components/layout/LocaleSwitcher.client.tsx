"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { type Locale } from "@/lib/i18n-config";

export interface LocaleSwitcherProps {
  currentLocale: Locale;
  variant?: "dropdown" | "inline";
}

export default function LocaleSwitcher({ currentLocale, variant = "dropdown" }: LocaleSwitcherProps) {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "tr", name: "Türkçe" },
    { code: "de", name: "Deutsch" },
    { code: "ru", name: "Русский" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
  ];

  const currentLang = languages.find((language) => language.code === currentLocale) || languages[0];

  const redirectedPathName = (locale: string) => {
    if (!pathName) {
      return "/";
    }
    const segments = pathName.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const handleLocaleChange = (locale: string) => {
    posthog.capture("locale_changed", {
      previous_locale: currentLocale,
      new_locale: locale,
    });
    router.push(redirectedPathName(locale));
    setIsOpen(false);
  };

  useEffect(() => {
    if (variant === "inline") {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  if (variant === "inline") {
    return (
      <div className="w-full space-y-2">
        <button
          onClick={() => setIsOpen((previous) => !previous)}
          className="flex w-full items-center justify-between border-2 border-black bg-secondary px-4 py-3 font-display text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-zinc-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">{currentLocale.toUpperCase()}</span>
            <span className="text-white">{currentLang.name}</span>
          </div>
          <span className={`text-white transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "mt-4 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 gap-2 border-l-2 border-zinc-700 py-1 pl-4">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLocaleChange(language.code)}
                className={`w-full px-3 py-2 text-left font-display text-[10px] transition-colors ${
                  currentLocale === language.code
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-400 hover:bg-secondary hover:text-white"
                }`}
              >
                <span className="mr-2 opacity-50">{language.code.toUpperCase()}</span>
                {language.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex items-center gap-2 border-2 border-black bg-secondary px-3 py-2 font-display text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-zinc-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
      >
        <span className="text-zinc-500">{currentLocale.toUpperCase()}</span>
        <span className="text-white">{currentLang.name}</span>
        <span className={`text-white transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-[100] mt-1 w-48 animate-in fade-in slide-in-from-top-2 border-4 border-black bg-bg-panel shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] duration-100">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLocaleChange(language.code)}
                className={`w-full px-4 py-2 text-left font-display text-[10px] transition-colors ${
                  currentLocale === language.code
                    ? "bg-primary text-white"
                    : "text-zinc-400 hover:bg-secondary hover:text-white"
                }`}
              >
                <span className="mr-2 opacity-50">{language.code.toUpperCase()}</span>
                {language.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
