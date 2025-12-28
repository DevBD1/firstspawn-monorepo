import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "../../lib/i18n-config";
import { getDictionary } from "../../lib/get-dictionary";
import Navbar from "../../components/layout/Navbar";
import { Suspense } from "react";
import Footer from "../../components/layout/Footer";
import CookieConsent from "../../components/layout/CookieConsent";
import { PostHogProvider } from "../../components/providers/PostHogProvider";
import PostHogPageView from "../../components/providers/PostHogPageView";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start-2p",
});

const vt323 = VT323({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-vt323",
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}): Promise<Metadata> {
    const { lang } = await params;
    const dict = await getDictionary(lang as Locale);

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
    const { lang } = (await params) as { lang: Locale };
    const dictionary = await getDictionary(lang);

    return (
        <html lang={lang}>
            <PostHogProvider>
                <body
                    className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${pressStart2P.variable} 
          ${vt323.variable} 
          antialiased min-h-screen flex flex-col
        `}
            >
                <div className="crt-overlay" />
                <Navbar lang={lang} dictionary={dictionary} />
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
