import type { AppDictionary } from "@/lib/dictionaries/schema";
import { getDictionary } from "@/lib/get-dictionary";
import { resolveLocaleParam } from "@/lib/resolve-locale";
import FeatureTeaser, { V2_TARGET_DATE } from "@/components/ui/FeatureTeaser.client";

export default async function CommunityPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: langParam } = await params;
  const lang = resolveLocaleParam(langParam);
  const dictionary = (await getDictionary(lang)) as AppDictionary;
  const copy = dictionary.communityPage;

  return <FeatureTeaser copy={copy} targetDate={V2_TARGET_DATE} waitlistCount={2417} />;
}
