import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import {
  PageBackdrop,
  PageContainer,
  PageSectionHeader,
  PageSurface,
} from "@/components/ui/PagePrimitives";

export default async function DebugOG({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.debugPages;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background py-12">
      <PageBackdrop />
      <PageContainer className="relative z-10">
        <PageSurface className="mx-auto flex max-w-5xl flex-col gap-6 p-6 md:p-10">
          <PageSectionHeader
            title={`${copy.ogPreviewTitle}: ${lang.toUpperCase()}`}
            subtitle={`${copy.ogPreviewPathLabel}: /${lang}/opengraph-image`}
          />
          <div className="border-2 border-dashed border-foreground/25 bg-background/55 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- raw OG endpoint preview */}
            <img
              src={`/${lang}/opengraph-image`}
              alt={copy.ogPreviewImageAlt}
              className="block h-auto max-w-full"
            />
          </div>
        </PageSurface>
      </PageContainer>
    </main>
  );
}
