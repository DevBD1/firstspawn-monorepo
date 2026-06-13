import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { LegalPageShell } from "@/components/ui/PageShells";

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.legal.privacy;

  return (
    <LegalPageShell
      description={copy.description}
      locale={lang}
      localeLabel={copy.localeLabel}
      noticeBadge={copy.noticeBadge}
      noticeBody={copy.noticeBody}
      title={copy.title}
    />
  );
}
