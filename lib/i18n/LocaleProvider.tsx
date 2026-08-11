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

function detectLocale(pathname: string, initialLocale?: Locale): Locale {
  if (localeFromPathname(pathname) === "ru") return "ru";
  // Browser URL may still show /ru while usePathname() is rewritten to /
  if (typeof window !== "undefined") {
    if (localeFromPathname(window.location.pathname) === "ru") return "ru";
  }
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
