import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { CenteredPageShell } from "@/components/ui/PageShells";

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.communityPage;

  return <CenteredPageShell badge={copy.badge} description={copy.description} title={copy.title} />;
}
