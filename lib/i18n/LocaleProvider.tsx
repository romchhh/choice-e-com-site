"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { localeFromPathname, localePath } from "./paths";
import { getDictionary, type Dictionary } from "./dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
  lp: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dict: getDictionary(DEFAULT_LOCALE),
  lp: (path) => localePath(path, DEFAULT_LOCALE),
});

/**
 * Resolve locale from the real browser URL when possible.
 * Middleware rewrites /ru → /, so usePathname() alone is unreliable,
 * and SSR initialLocale must not stick after client-side UA↔RU switches.
 */
function detectLocale(pathname: string, initialLocale?: Locale): Locale {
  if (typeof window !== "undefined") {
    return localeFromPathname(window.location.pathname);
  }
  const fromPath = localeFromPathname(pathname);
  if (fromPath === "ru") return "ru";
  return initialLocale || DEFAULT_LOCALE;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const pathname = usePathname() || "/";
  const [locale, setLocale] = useState<Locale>(() =>
    detectLocale(pathname, initialLocale)
  );

  useEffect(() => {
    setLocale(detectLocale(pathname, initialLocale));
  }, [pathname, initialLocale]);

  // Catch back/forward and any URL change not reflected in usePathname yet
  useEffect(() => {
    const sync = () => setLocale(localeFromPathname(window.location.pathname));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      lp: (path: string) => localePath(path, locale),
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
