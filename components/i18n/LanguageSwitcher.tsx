"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { localePath, stripLocalePrefix } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  // Browser URL is source of truth (/ru is rewritten away from usePathname)
  const browserPath =
    typeof window !== "undefined" ? window.location.pathname : pathname;
  const barePath = stripLocalePrefix(browserPath);
  const hrefFor = (next: Locale) => localePath(`${barePath}${search}`, next);

  return (
    <div
      className={`inline-flex items-center gap-1 font-['Montserrat'] text-xs sm:text-sm font-semibold tracking-wide text-current ${className}`}
      aria-label="Language"
    >
      {/* Full document navigation: layout getLocale() + client dict stay in sync */}
      <a
        href={hrefFor("uk")}
        className={
          locale === "uk"
            ? "underline underline-offset-2"
            : "opacity-60 hover:opacity-100"
        }
        hrefLang="uk"
      >
        UA
      </a>
      <span className="opacity-40" aria-hidden>
        |
      </span>
      <a
        href={hrefFor("ru")}
        className={
          locale === "ru"
            ? "underline underline-offset-2"
            : "opacity-60 hover:opacity-100"
        }
        hrefLang="ru"
      >
        RU
      </a>
    </div>
  );
}
