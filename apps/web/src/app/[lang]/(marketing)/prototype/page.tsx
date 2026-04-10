import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import PrototypeLanding from "@/features/landing/components/PrototypeLanding.client";

export default async function PrototypePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dict = await getDictionary(lang);

  return (
    <main className="w-full">
      <PrototypeLanding lang={lang} dictionary={dict} />
    </main>
  );
}
