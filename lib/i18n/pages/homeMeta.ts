import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildSeoMetadata } from "@/lib/i18n/seo";

export function buildHomeMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return buildSeoMetadata({
    locale,
    path: "/",
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    ogType: "website",
    imageAlt: dict.hero.imageAlt,
  });
}
