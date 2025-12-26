"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PixelButton from "../pixel/PixelButton";
import LocaleSwitcher from "./LocaleSwitcher";
import type { Locale } from "../../lib/i18n-config";

interface NavbarProps {
    lang: Locale;
    dictionary: {
        common: { brand: string; tagline: string };
        nav: { discover: string; myLoot: string; console: string };
    };
}

export default function Navbar({ lang, dictionary }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={`flex ${isMobile ? "flex-col gap-8" : "flex-row gap-2"} items-center w-full`}>
            <PixelButton
                href={`/${lang}/discover`}
                variant="secondary"
                className={isMobile ? "w-full py-4 text-xs" : ""}
                onClick={() => setIsOpen(false)}
            >
                {dictionary.nav.discover}
            </PixelButton>
            <PixelButton
                href={`/${lang}/loot`}
                variant="secondary"
                className={isMobile ? "w-full py-4 text-xs" : ""}
                onClick={() => setIsOpen(false)}
            >
                {dictionary.nav.myLoot}
            </PixelButton>
            <PixelButton
                href={`/${lang}/console`}
                variant="success"
                className={isMobile ? "w-full py-4 text-xs" : ""}
                onClick={() => setIsOpen(false)}
            >
                {dictionary.nav.console}
            </PixelButton>
        </div>
    );

    return (
        <nav className="sticky top-0 z-[100] bg-[#1a1a1a]/95 backdrop-blur-md border-b-4 border-black px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Brand & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    {/* Hamburger Button (Mobile Only) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2 bg-panel border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                        aria-label="Menu"
                    >
                        <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? "opacity-0" : ""}`} />
                        <div className={`w-6 h-0.5 bg-white transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </button>

                    <Link href={`/${lang}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-accent-blue border-2 border-black flex items-center justify-center text-white pixel-font text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                            F
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="pixel-font text-lg tracking-tighter text-white">
                                {dictionary.common.brand}
                            </h1>
                            <p className="text-[8px] pixel-font text-gray-500 uppercase">
                                {dictionary.common.tagline}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4">
                    <NavLinks />
                    <div className="h-8 w-1 bg-black mx-2" />
                    <LocaleSwitcher currentLocale={lang} />
                </div>

                {/* Mobile Right Content */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="sm:hidden pixel-font text-[10px] text-zinc-500">
                        SPAWN
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar (Drawer) Overlay */}
            <div
                className={`
                    fixed inset-0 z-[101] bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden
                    ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                `}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Sidebar (Drawer) */}
            <div
                className={`
                    fixed top-0 left-0 h-[100dvh] w-[85%] max-w-[320px] bg-panel border-r-4 border-black z-[102] transition-transform duration-300 ease-in-out md:hidden flex flex-col
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Drawer Header */}
                <div className="p-5 border-b-4 border-black bg-[#1a1a1a] flex items-center justify-between flex-shrink-0">
                    <div className="pixel-font text-sm text-accent-blue tracking-widest">NAV_TERMINAL</div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-black bg-panel-light shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        <span className="pixel-font text-sm text-white">X</span>
                    </button>
                </div>

                {/* Links */}
                <div className="flex-grow p-6 overflow-y-auto min-h-0">
                    <div className="pr-1 pb-4"> {/* pr-1 helps with shadow overflow, pb-4 for scroll spacing */}
                        <NavLinks isMobile />
                    </div>
                </div>

                {/* Footer / Locale Switcher in Drawer */}
                <div className="p-6 border-t-4 border-black bg-[#1a1a1a] flex-shrink-0">
                    <p className="pixel-font text-[10px] text-gray-500 mb-4 tracking-tighter uppercase">Environment.Locale</p>
                    <LocaleSwitcher currentLocale={lang} variant="inline" />
                </div>
            </div>
        </nav>
    );
}



