import "server-only";
import type { Locale } from "./i18n-config";

export interface Dictionary {
  common: {
    site_title?: string;
    brand?: string;
    tagline?: string;
    [key: string]: string | undefined;
  };
  auth?: {
    activation?: {
      title: string;
      message: string;
      instruction: string;
      spam_warning: string;
      provider_warning: string;
    };
    shared?: {
      backToHome: string;
    };
    [key: string]: any;
  };
  [key: string]: unknown;
}

type DictionaryLoader = () => Promise<Dictionary>;

const dictionaries: Record<Locale, DictionaryLoader> = {
  en: () =>
    import("./dictionaries/en.json").then((module) => module.default as unknown as Dictionary),
  tr: () =>
    import("./dictionaries/tr.json").then((module) => module.default as unknown as Dictionary),
  de: () =>
    import("./dictionaries/de.json").then((module) => module.default as unknown as Dictionary),
  ru: () =>
    import("./dictionaries/ru.json").then((module) => module.default as unknown as Dictionary),
  es: () =>
    import("./dictionaries/es.json").then((module) => module.default as unknown as Dictionary),
  fr: () =>
    import("./dictionaries/fr.json").then((module) => module.default as unknown as Dictionary),
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

function mergeDictionaries(fallback: Dictionary, target: Dictionary): Dictionary {
  const merged = JSON.parse(JSON.stringify(fallback)) as Dictionary;

  for (const category in target) {
    const targetCategory = target[category];
    const mergedCategory = merged[category];

    if (isObjectRecord(mergedCategory) && isObjectRecord(targetCategory)) {
      merged[category] = {
        ...mergedCategory,
        ...targetCategory,
      };
      continue;
    }

    merged[category] = targetCategory;
  }

  return merged;
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const englishDict = await dictionaries.en();
  if (locale === "en") {
    return englishDict;
  }

  const targetDict = await dictionaries[locale]();
  return mergeDictionaries(englishDict, targetDict);
};
