"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { type Locale } from "@/lib/i18n-config";

export interface LocaleSwitcherProps {
  currentLocale: Locale;
  variant?: "dropdown" | "inline";
}

export default function LocaleSwitcher({
  currentLocale,
  variant = "dropdown",
}: LocaleSwitcherProps) {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", name: "English" },
    { code: "tr", name: "Türkçe" },
    { code: "de", name: "Deutsch" },
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
      <div className="w-full space-y-2 text-left">
        <button
          onClick={() => setIsOpen((previous) => !previous)}
          className="flex w-full items-center justify-between border border-border bg-secondary hover:bg-secondary-hover px-4 py-3 font-body text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            <span className="text-muted">{currentLocale.toUpperCase()}</span>
            <span className="text-foreground">{currentLang.name}</span>
          </div>
          <span
            className={`text-muted transition-transform duration-120 ${isOpen ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "mt-4 max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 gap-1 border-l border-border py-1 pl-4">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLocaleChange(language.code)}
                className={`w-full px-3 py-2 text-left font-body text-xs rounded-lg transition-colors cursor-pointer ${
                  currentLocale === language.code
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted hover:bg-secondary/40 hover:text-foreground"
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
        className="flex items-center gap-2 border border-border bg-transparent hover:bg-secondary/40 px-3.5 py-1.5 font-body text-[13px] font-semibold rounded-full transition-colors cursor-pointer min-h-[36px]"
      >
        <span className="text-muted">{currentLocale.toUpperCase()}</span>
        <span className="text-foreground">{currentLang.name}</span>
        <span
          className={`text-muted transition-transform duration-120 ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[100] mt-1 w-44 animate-in fade-in slide-in-from-top-2 border border-border bg-bg-panel rounded-xl shadow-lg overflow-hidden py-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLocaleChange(language.code)}
              className={`w-full px-4 py-2 text-left font-body text-xs transition-colors cursor-pointer ${
                currentLocale === language.code
                  ? "bg-primary text-on-primary font-bold"
                  : "text-muted hover:bg-secondary/40 hover:text-foreground"
              }`}
            >
              <span className="mr-2 opacity-50">{language.code.toUpperCase()}</span>
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
