"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { localePath, stripLocalePrefix } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  // usePathname() may return rewritten path (/) or /ru — always strip, then re-prefix
  const barePath = stripLocalePrefix(pathname);
  const hrefFor = (next: Locale) => localePath(`${barePath}${search}`, next);

  return (
    <div
      className={`inline-flex items-center gap-1 font-['Montserrat'] text-xs sm:text-sm font-semibold tracking-wide text-current ${className}`}
      aria-label="Language"
    >
      <Link
        href={hrefFor("uk")}
        className={
          locale === "uk"
            ? "underline underline-offset-2"
            : "opacity-60 hover:opacity-100"
        }
        hrefLang="uk"
        scroll={false}
      >
        UA
      </Link>
      <span className="opacity-40" aria-hidden>
        |
      </span>
      <Link
        href={hrefFor("ru")}
        className={
          locale === "ru"
            ? "underline underline-offset-2"
            : "opacity-60 hover:opacity-100"
        }
        hrefLang="ru"
        scroll={false}
      >
        RU
      </Link>
    </div>
  );
}
