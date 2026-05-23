import type { LandingContentModel, LandingFeatureItem } from "@/features/landing/types";
import type { AppDictionary } from "@/lib/dictionaries/schema";

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
