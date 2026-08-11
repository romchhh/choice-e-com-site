export type { Locale } from "./config";
export { DEFAULT_LOCALE, LOCALES, LOCALE_HEADER, RU_PREFIX } from "./config";
export { getLocale, getLocaleFromHeaders } from "./getLocale";
export { localePath, stripLocalePrefix, localeFromPathname, switchLocalePath } from "./paths";
export { getDictionary } from "./dictionaries";
export type { Dictionary } from "./dictionaries";
