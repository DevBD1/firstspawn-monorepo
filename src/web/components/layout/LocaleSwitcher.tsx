"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import posthog from "posthog-js";
import { type Locale } from "../../lib/i18n-config";

interface LocaleSwitcherProps {
    currentLocale: Locale;
    variant?: "dropdown" | "inline";
}

export default function LocaleSwitcher({
    currentLocale,
    variant = "dropdown"
}: LocaleSwitcherProps) {
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

    const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

    const redirectedPathName = (locale: string) => {
        if (!pathName) return "/";
        const segments = pathName.split("/");
        segments[1] = locale;
        return segments.join("/");
    };

    const handleLocaleChange = (locale: string) => {
        posthog.capture('locale_changed', {
            previous_locale: currentLocale,
            new_locale: locale,
        });
        router.push(redirectedPathName(locale));
        setIsOpen(false);
    };

    // Close dropdown on click outside
    useEffect(() => {
        if (variant === "inline") return;
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [variant]);

    if (variant === "inline") {
        return (
            <div className="w-full space-y-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full pixel-font text-[10px] px-4 py-3 bg-secondary border-2 border-black flex items-center justify-between hover:bg-zinc-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-zinc-500">{currentLocale.toUpperCase()}</span>
                        <span className="text-white">{currentLang.name}</span>
                    </div>
                    <span className={`transition-transform text-white ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </button>

                <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"}
                `}>
                    <div className="grid grid-cols-1 gap-2 border-l-2 border-zinc-700 pl-4 py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLocaleChange(lang.code)}
                                className={`
                                    w-full text-left px-3 py-2 pixel-font text-[10px] transition-colors
                                    ${currentLocale === lang.code
                                        ? "text-primary bg-primary/10"
                                        : "text-zinc-400 hover:text-white hover:bg-secondary"
                                    }
                                `}
                            >
                                <span className="opacity-50 mr-2">{lang.code.toUpperCase()}</span>
                                {lang.name}
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
                onClick={() => setIsOpen(!isOpen)}
                className="pixel-font text-[10px] px-3 py-2 bg-secondary border-2 border-black flex items-center gap-2 hover:bg-zinc-700 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
                <span className="text-zinc-500">{currentLocale.toUpperCase()}</span>
                <span className="text-white">{currentLang.name}</span>
                <span className={`transition-transform text-white ${isOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-1 w-48 bg-bg-panel border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-[100] animate-in fade-in slide-in-from-top-2 duration-100"
                >
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLocaleChange(lang.code)}
                                className={`
                                    w-full text-left px-4 py-2 pixel-font text-[10px] transition-colors
                                    ${currentLocale === lang.code
                                        ? "bg-primary text-white"
                                        : "text-zinc-400 hover:bg-secondary hover:text-white"
                                    }
                                `}
                            >
                                <span className="opacity-50 mr-2">{lang.code.toUpperCase()}</span>
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


