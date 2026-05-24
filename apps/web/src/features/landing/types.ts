import type { AppDictionary } from "@/lib/dictionaries/schema";

export interface LandingFeatureItem {
  description: string;
  icon: string;
  title: string;
}

export interface LandingContentModel {
  brand: string;
  features: LandingFeatureItem[];
  landing: AppDictionary["landing"];
}
