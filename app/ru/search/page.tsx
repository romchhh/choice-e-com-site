import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildSearchMetadata } from "../../(site)/search/page";

export function generateMetadata(): Metadata {
  return buildSearchMetadata(LOCALE_RU);
}

export default function RuSearchPage() {
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
