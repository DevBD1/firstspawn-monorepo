import { getAuthState } from "@/lib/auth";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import MarketingChrome from "@/components/layout/MarketingChrome";
import type { MarketingChromeDictionary } from "@/components/layout/MarketingChrome";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as unknown as MarketingChromeDictionary;
  const authState = await getAuthState();

  return (
    <MarketingChrome
      lang={lang}
      dictionary={dictionary}
      isAuthenticated={authState.isAuthenticated}
    >
      {children}
    </MarketingChrome>
  );
}
