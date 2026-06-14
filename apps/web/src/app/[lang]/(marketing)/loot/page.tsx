import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/auth";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import FeatureTeaser, { V2_TARGET_DATE } from "@/components/ui/FeatureTeaser.client";

export default async function LootPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const session = await getAuthState();
  if (!session.isAuthenticated) {
    redirect(`/${lang}/login?next=/${lang}/loot`);
  }

  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.lootPage;
  const username = session.user?.username || copy.fallbackUsername;
  const description = copy.description.replace("{username}", username);

  return (
    <FeatureTeaser
      copy={{ ...copy, description }}
      targetDate={V2_TARGET_DATE}
      waitlistCount={1893}
    />
  );
}
