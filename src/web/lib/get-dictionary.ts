import "server-only";
import type { Locale } from "./i18n-config";

const dictionaries: any = {
    en: () => import("./dictionaries/en.json").then((module) => module.default),
    tr: () => import("./dictionaries/tr.json").then((module) => module.default),
    de: () => import("./dictionaries/de.json").then((module) => module.default),
    ru: () => import("./dictionaries/ru.json").then((module) => module.default),
    es: () => import("./dictionaries/es.json").then((module) => module.default),
    fr: () => import("./dictionaries/fr.json").then((module) => module.default),
};

const deepMerge = (target: any, source: any) => {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
};

// Simplified merge for nested dictionaries
function mergeDictionaries(fallback: any, target: any) {
    const merged = JSON.parse(JSON.stringify(fallback)); // Clone English

    for (const category in target) {
        if (merged[category]) {
            merged[category] = { ...merged[category], ...target[category] };
        } else {
            merged[category] = target[category];
        }
    }

    return merged;
}

export const getDictionary = async (locale: Locale) => {
    const englishDict = await dictionaries.en();
    const targetLoader = dictionaries[locale];
    if (locale === "en" || !targetLoader) return englishDict;

    const targetDict = await targetLoader();

    return mergeDictionaries(englishDict, targetDict); // Merge target into English foundations
};
