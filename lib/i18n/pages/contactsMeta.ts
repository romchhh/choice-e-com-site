import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { getContactsCopy } from "@/lib/i18n/content/contacts";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export function buildContactsLayoutMetadata(locale: Locale): Metadata {
  const t = getContactsCopy(locale);
  return buildPageMetadata(locale, "/contacts", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogType: "website",
  });
}
