import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "../globals.css";
import { i18n } from "../../lib/i18n-config";
import { getDictionary } from "../../lib/get-dictionary";
import { getAuthState } from "../../lib/auth";
import { resolveLocaleParam } from "../../lib/resolve-locale";
import Navbar from "../../components/layout/Navbar";
import { Suspense } from "react";
import Footer from "../../components/layout/Footer";
import CookieConsent from "../../components/layout/CookieConsent";
import { PostHogProvider } from "../../components/providers/PostHogProvider";
import PostHogPageView from "../../components/providers/PostHogPageView";

const vt323 = VT323({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-ui-base",
});

const jetBrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-body-base",
});

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-display-base",
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang: langParam } = await params;
    const lang = resolveLocaleParam(langParam);
    const dict = await getDictionary(lang);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firstspawn.com';

    const languages: Record<string, string> = {};
    i18n.locales.forEach((locale) => {
        languages[locale] = `${baseUrl}/${locale}`;
    });

    return {
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: `${baseUrl}/${lang}`,
            languages: languages,
        },
        title: {
            default: dict.common.site_title,
            template: `%s | ${dict.common.brand}`,
        },
        description: dict.common.tagline,
        icons: {
            icon: "/favicon.ico",
        },
        openGraph: {
            title: dict.common.brand,
            description: dict.common.tagline,
            url: baseUrl,
            siteName: dict.common.brand,
            locale: lang,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: dict.common.brand,
            description: dict.common.tagline,
            creator: '@FirstSpawn', // Replace with actual handle if available
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang: langParam } = await params;
    const lang = resolveLocaleParam(langParam);
    const dictionary = await getDictionary(lang);
    const authState = await getAuthState();

    return (
        <html lang={lang}>
            <PostHogProvider>
                <body
                    className={`
          ${jetBrainsMono.variable} 
          ${vt323.variable} 
          ${pressStart2P.variable} 
          antialiased min-h-screen flex flex-col
        `}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: dictionary.common.brand,
                            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://firstspawn.com',
                            description: dictionary.common.tagline,
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://firstspawn.com'}/search?q={search_term_string}`,
                                'query-input': 'required name=search_term_string',
                            },
                        }),
                    }}
                />
                <div className="crt-overlay" />
                <Navbar lang={lang} dictionary={dictionary} isAuthenticated={authState.isAuthenticated} />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer lang={lang} dictionary={dictionary} />
                <CookieConsent dictionary={dictionary} />
                <Suspense fallback={null}>
                    <PostHogPageView />
                </Suspense>
            </body>
            </PostHogProvider>
        </html>
    );
}
