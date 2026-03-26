import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import DiscoverClient from "@/features/discover/components/DiscoverClient.client";

export default async function DiscoverPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = await getDictionary(lang);

  return (
    <main className="w-full">
      <DiscoverClient lang={lang} dictionary={dictionary} />
    </main>
  );
}
