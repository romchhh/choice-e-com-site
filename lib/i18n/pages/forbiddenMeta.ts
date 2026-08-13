import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

export function buildForbiddenMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    title: `${dict.forbidden.title} | ${SITE_STORE_NAME}`,
    description: dict.forbidden.title,
    robots: { index: false, follow: false },
  };
}
