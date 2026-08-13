import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { getInfoCopy } from "@/lib/i18n/content/info";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export function buildInfoLayoutMetadata(locale: Locale): Metadata {
  const t = getInfoCopy(locale);
  return buildPageMetadata(locale, "/info", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogType: "website",
  });
}
