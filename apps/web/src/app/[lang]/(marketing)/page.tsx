import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import LandingDiscoverySection from "@/features/landing/components/LandingDiscoverySection.client";
import LandingFeaturesSection from "@/features/landing/components/LandingFeaturesSection.client";
import LandingFinalCtaSection from "@/features/landing/components/LandingFinalCtaSection.client";
import LandingHeroSection from "@/features/landing/components/LandingHeroSection.client";
import LandingHowItWorksSection from "@/features/landing/components/LandingHowItWorksSection.client";
import LandingNewsletterBlock from "@/features/landing/components/LandingNewsletterBlock.client";
import LandingProofSection from "@/features/landing/components/LandingProofSection.client";
import LandingScrollScene from "@/features/landing/components/LandingScrollScene.client";
import { getLandingContent } from "@/features/landing/lib/landing-content";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);
  const content = getLandingContent(dictionary);

  return (
    <main className="relative isolate w-full overflow-hidden">
      <LandingScrollScene dictionary={dictionary} />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pb-32 pt-6 md:gap-24 md:px-8 md:pt-10">
        <section className="flex min-h-[calc(100svh-var(--fs-nav-height))] items-center">
          <div className="w-full space-y-8 md:space-y-10">
            <LandingHeroSection content={content} lang={lang} />
            <LandingDiscoverySection content={content} lang={lang} />
          </div>
        </section>

        <LandingFeaturesSection content={content} />
        <LandingHowItWorksSection content={content} />
        <LandingProofSection content={content} lang={lang} />
        <LandingFinalCtaSection content={content} lang={lang} />
        <LandingNewsletterBlock dictionary={dictionary} lang={lang} />
      </div>
    </main>
  );
}
