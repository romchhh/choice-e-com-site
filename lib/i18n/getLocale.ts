import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, type Locale, normalizeLocale } from "./config";

/**
 * Server-side locale from middleware header.
 * Prefer explicit locale from route tree (LOCALE_UK / LOCALE_RU) in storefront pages.
 * Used by API routes and legacy code paths only.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const h = await headers();
    return normalizeLocale(h.get(LOCALE_HEADER));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getLocaleFromHeaders(
  headerList: Headers | { get(name: string): string | null }
): Locale {
  return normalizeLocale(headerList.get(LOCALE_HEADER));
}
