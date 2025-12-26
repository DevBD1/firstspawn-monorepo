import type { Locale } from "../../lib/i18n-config";

interface FooterProps {
    lang: Locale;
    dictionary: {
        footer: { copyright: string; api: string; legal: string; trustBadge: string };
    };
}

export default function Footer({ lang, dictionary }: FooterProps) {
    return (
        <footer className="mt-20 py-8 border-t-4 border-black bg-[#111] text-center">
            <div className="pixel-font text-xs text-gray-600">
                {dictionary.footer.copyright}
            </div>
            <div className="mt-4 flex justify-center gap-4 text-gray-500 text-sm font-retro">
                <a href="#" className="hover:text-accent-blue transition-colors">
                    {dictionary.footer.api}
                </a>
                <a href="#" className="hover:text-accent-blue transition-colors">
                    {dictionary.footer.legal}
                </a>
                <a href="#" className="hover:text-accent-blue transition-colors">
                    {dictionary.footer.trustBadge}
                </a>
            </div>
        </footer>
    );
}
