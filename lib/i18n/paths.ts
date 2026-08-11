import { DEFAULT_LOCALE, type Locale, RU_PREFIX } from "./config";

/** Strip /ru prefix from pathname (keeps query/hash out — pass pathname only). */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === RU_PREFIX || pathname === `${RU_PREFIX}/`) return "/";
  if (pathname.startsWith(`${RU_PREFIX}/`)) {
    const rest = pathname.slice(RU_PREFIX.length);
    return rest || "/";
  }
  return pathname;
}

/** Detect locale from a browser pathname. */
export function localeFromPathname(pathname: string): Locale {
  if (pathname === RU_PREFIX || pathname.startsWith(`${RU_PREFIX}/`)) return "ru";
  return DEFAULT_LOCALE;
}

/**
 * Build a locale-aware path.
 * Examples: localePath("/catalog", "ru") → "/ru/catalog"
 *           localePath("/ru/catalog", "uk") → "/catalog"
 */
export function localePath(
  path: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (!path) return locale === "ru" ? RU_PREFIX : "/";

  const [pathnameWithQuery, hash = ""] = path.split("#");
  const hashPart = hash ? `#${hash}` : "";
  const [rawPath, query = ""] = pathnameWithQuery.split("?");
  const queryPart = query ? `?${query}` : "";

  const bare = stripLocalePrefix(rawPath || "/");
  const normalized = bare.startsWith("/") ? bare : `/${bare}`;

  if (locale === "ru") {
    if (normalized === "/") return `${RU_PREFIX}${queryPart}${hashPart}`;
    return `${RU_PREFIX}${normalized}${queryPart}${hashPart}`;
  }

  return `${normalized}${queryPart}${hashPart}`;
}

/** Switch current path to another locale, preserving query and hash. */
export function switchLocalePath(
  pathname: string,
  search: string,
  hash: string,
  nextLocale: Locale
): string {
  const bare = stripLocalePrefix(pathname);
  const q = search || "";
  const h = hash || "";
  return localePath(`${bare}${q}${h}`, nextLocale);
}
