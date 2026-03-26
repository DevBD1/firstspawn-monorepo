import { notFound } from "next/navigation";
import { i18n, type Locale } from "./i18n-config";

export const resolveLocaleParam = (lang: string): Locale => {
  if (!i18n.locales.includes(lang as Locale)) {
    notFound();
  }

  return lang as Locale;
};
