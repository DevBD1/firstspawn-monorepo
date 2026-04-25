import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import MarketingChrome from "@/components/layout/MarketingChrome";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const authState = await getAuthState();

  return (
    <MarketingChrome
      lang={lang}
      dictionary={dictionary}
      isAuthenticated={authState.isAuthenticated}
      user={authState.user}
    >
      {children}
    </MarketingChrome>
  );
}
