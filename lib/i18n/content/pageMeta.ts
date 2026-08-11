/**
 * @deprecated Prefer `@/lib/i18n/seo` — kept for existing imports.
 */
export {
  getSiteOrigin as getBaseUrl,
  buildSeoMetadata,
  absoluteLocaleUrl,
  hreflangAlternates,
} from "../seo";

import type { Metadata } from "next";
import type { Locale } from "../config";
import { buildSeoMetadata } from "../seo";

/** Localized page metadata with uk/ru hreflang alternates. */
export function buildPageMetadata(
  locale: Locale,
  path: string,
  opts: {
    title: string;
    description: string;
    ogDescription?: string;
    twitterDescription?: string;
    ogType?: "website" | "article";
    imagePath?: string;
    imageAlt?: string;
  }
): Metadata {
  return buildSeoMetadata({
    locale,
    path,
    title: opts.title,
    description: opts.ogDescription ?? opts.description,
    ogType: opts.ogType ?? "article",
    image: opts.imagePath,
    imageAlt: opts.imageAlt,
  });
}
