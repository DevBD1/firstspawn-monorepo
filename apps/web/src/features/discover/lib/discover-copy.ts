import type { AppDictionary, DiscoverDictionary } from "@/lib/dictionaries/schema";

export const getDiscoverCopy = (dictionary: AppDictionary): DiscoverDictionary =>
  dictionary.discover;
