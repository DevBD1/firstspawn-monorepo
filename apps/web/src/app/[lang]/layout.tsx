import type { Metadata } from "next";
import { Suspense } from "react";
import { JetBrains_Mono, Press_Start_2P, VT323 } from "next/font/google";
import "../globals.css";
import { i18n } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { PostHogProvider } from "@/components/providers/PostHogProvider.client";
import PostHogPageView from "@/components/providers/PostHogPageView.client";
import { getPublicConfig } from "@/lib/config";
import type { AppDictionary } from "@/lib/dictionaries/schema";

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
  const dict = (await getDictionary(lang)) as AppDictionary;
  const brand = dict.common.brand;
  const siteTitle = dict.common.siteTitle;
  const tagline = dict.common.tagline;

  const { NEXT_PUBLIC_SITE_URL: baseUrl } = getPublicConfig();

  const languages: Record<string, string> = {};
  i18n.locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}`;
  });

  return {
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages,
    },
    title: {
      default: siteTitle,
      template: `%s | ${brand}`,
    },
    description: tagline,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: brand,
      description: tagline,
      url: baseUrl,
      siteName: brand,
      locale: lang,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: brand,
      description: tagline,
      creator: "@FirstSpawn",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
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
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const brand = dictionary.common.brand;
  const tagline = dictionary.common.tagline;
  const { NEXT_PUBLIC_SITE_URL: siteUrl } = getPublicConfig();

  return (
    <html lang={lang}>
      <body
        className={`${jetBrainsMono.variable} ${vt323.variable} ${pressStart2P.variable} antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: brand,
              url: siteUrl,
              description: tagline,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <PostHogProvider>
          <div className="crt-overlay" />
          {children}
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
        </PostHogProvider>
      </body>
    </html>
  );
}
