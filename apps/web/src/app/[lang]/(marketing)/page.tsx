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
import { getLandingContent, SECTION_SURFACE_CLASS } from "@/features/landing/lib/landing-content";
import { getLandingRealtimeStats } from "@/features/landing/lib/landing-stats";
import {
  PixelCorners,
  SectionSurface,
  joinClasses,
} from "@/features/landing/components/LandingShared";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const [dictionary, realtimeStats] = await Promise.all([
    getDictionary(lang),
    getLandingRealtimeStats(),
  ]);
  const content = getLandingContent(dictionary, realtimeStats);

  return (
    <main className="relative isolate w-full overflow-hidden">
      <LandingScrollScene dictionary={dictionary} />

      <div className="relative z-10 mx-auto flex w-full max-w-[96rem] flex-col gap-20 px-4 pb-32 pt-6 2xl:max-w-[104rem] md:gap-24 md:px-8 md:pt-10">
        <section className="flex min-h-[calc(100svh-var(--fs-nav-height))] items-center">
          <SectionSurface
            className={joinClasses(
              SECTION_SURFACE_CLASS,
              "w-full bg-background/80 p-0 backdrop-blur-[3px]"
            )}
          >
            <PixelCorners />
            <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-72 -translate-x-1/2 rounded-full bg-fs-diamond/10 blur-3xl" />
            <div className="grid min-h-[38rem] w-full divide-y-4 divide-black xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:divide-x-4 xl:divide-y-0 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="min-w-0 px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10 xl:px-10 xl:py-10 2xl:px-12 2xl:py-12">
                <LandingHeroSection content={content} lang={lang} />
              </div>
              <div className="min-w-0 px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 xl:px-8 xl:py-8 2xl:px-10 2xl:py-10">
                <LandingDiscoverySection content={content} lang={lang} />
              </div>
            </div>
          </SectionSurface>
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
