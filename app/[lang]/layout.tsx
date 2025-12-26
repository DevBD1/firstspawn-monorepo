import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "../../lib/i18n-config";
import { getDictionary } from "../../lib/get-dictionary";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

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

    return {
        title: dict.common.brand,
        description: dict.common.tagline,
        icons: {
            icon: "@/public/favicon.ico",
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
            </body>
        </html>
    );
}
