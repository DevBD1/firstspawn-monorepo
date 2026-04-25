import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import { CenteredPageShell } from "@/components/ui/PageShells";

export default async function ConsolePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/console`);
  }

  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.consolePage;
  const username = session.user?.username || copy.fallbackUsername;
  const description = copy.description.replace("{username}", username);

  return <CenteredPageShell badge={copy.badge} description={description} title={copy.title} />;
}
