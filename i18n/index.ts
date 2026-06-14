import { en } from "./en";
import { sw } from "./sw";

export type TranslationKey = keyof typeof en;
export type NestedKey<K extends string> = K;

export type Translations = typeof en;

const translations: Record<string, Translations> = { en, sw };

export function getTranslations(locale: string): Translations {
  return translations[locale] || en;
}

export function t(translations: Translations, path: string, params?: Record<string, string | number>): string {
  let value: any = translations;
  const keys = path.split(".");
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return path;
  }
  if (typeof value !== "string") return path;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? `{{${key}}}`));
}
