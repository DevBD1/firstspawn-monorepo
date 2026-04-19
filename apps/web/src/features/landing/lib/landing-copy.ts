import type {
  AppDictionary,
  LandingDictionary as LandingCopyDictionary,
} from "@/lib/dictionaries/schema";

export const getLandingCopy = (dictionary: AppDictionary): LandingCopyDictionary =>
  dictionary.landing;
