import type { LandingContentModel, LandingFeatureItem } from "@/features/landing/types";
import type { AppDictionary } from "@/lib/dictionaries/schema";

export const SECTION_SURFACE_CLASS =
  "relative overflow-hidden border-4 border-black bg-background/72 p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px] md:p-8";
export const CARD_SURFACE_CLASS =
  "relative h-full overflow-hidden border-4 border-black bg-bg-panel/72 p-5 shadow-[6px_6px_0_0_rgba(0,0,0,1)] backdrop-blur-[2px]";

const FEATURE_ICONS = ["⚡", "✓", "◆", "★"] as const;

const buildFeatures = (landing: AppDictionary["landing"]): LandingFeatureItem[] =>
  landing.features.items.map((item, index) => ({
    description: item.description,
    icon: FEATURE_ICONS[index] ?? FEATURE_ICONS[FEATURE_ICONS.length - 1],
    title: item.title,
  }));

export const getLandingContent = (dictionary: AppDictionary): LandingContentModel => {
  const landing = dictionary.landing;
  const brand = dictionary.common.brand;

  return {
    brand,
    features: buildFeatures(landing),
    landing,
  };
};
