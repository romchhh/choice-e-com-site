import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";
import type { Locale } from "@/lib/i18n/config";

export function buildSearchMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return buildPageMetadata(locale, "/search", {
    title: `${dict.searchPage.title} | ForBody Space`,
    description: dict.searchPage.metaDescription,
  });
}

export function generateMetadata(): Metadata {
  return buildSearchMetadata(LOCALE_UK);
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] animate-pulse bg-[#FFF9F0]" />
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
