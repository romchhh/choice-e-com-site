export const LOCALES = ["uk", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uk";
export const LOCALE_HEADER = "x-locale";
export const RU_PREFIX = "/ru";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "uk" || value === "ru";
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
