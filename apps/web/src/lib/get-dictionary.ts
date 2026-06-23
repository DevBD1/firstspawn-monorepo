import "server-only";
import type { Locale } from "./i18n-config";
import type { AppDictionary } from "./dictionaries/schema";

type DictionaryLoader = () => Promise<AppDictionary>;

const dictionaries: Record<Locale, DictionaryLoader> = {
  en: () =>
    import("./dictionaries/en.json").then((module) => module.default as unknown as AppDictionary),
  tr: () =>
    import("./dictionaries/tr.json").then((module) => module.default as unknown as AppDictionary),
  de: () =>
    import("./dictionaries/de.json").then((module) => module.default as unknown as AppDictionary),
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

function deepMerge<T>(fallback: T, target: Partial<T>): T {
  if (Array.isArray(fallback) || Array.isArray(target)) {
    return ((target as T | undefined) ?? fallback) as T;
  }

  if (!isObjectRecord(fallback) || !isObjectRecord(target)) {
    return ((target as T | undefined) ?? fallback) as T;
  }

  const merged: Record<string, unknown> = { ...fallback };

  for (const [key, value] of Object.entries(target)) {
    if (value === undefined) {
      continue;
    }

    const fallbackValue = merged[key];
    if (isObjectRecord(fallbackValue) && isObjectRecord(value)) {
      merged[key] = deepMerge(fallbackValue, value);
      continue;
    }

    merged[key] = value;
  }

  return merged as T;
}

export const getDictionary = async (locale: Locale): Promise<AppDictionary> => {
  const englishDict = await dictionaries.en();
  if (locale === "en") {
    return englishDict;
  }

  const targetDict = await dictionaries[locale]();
  return deepMerge(englishDict, targetDict);
};
