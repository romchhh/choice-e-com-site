import type { Metadata } from "next";
import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";
import { buildSeoMetadata } from "./seo";

export function buildSiteLayoutMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    ...buildSeoMetadata({
      locale,
      path: "/",
      title: dict.meta.title,
      description: dict.meta.description,
      keywords: dict.meta.keywords,
      ogType: "website",
      imageAlt: dict.hero.imageAlt,
    }),
    icons: {
      icon: "/images/choice-features/open-browser.png",
      shortcut: "/images/choice-features/open-browser.png",
      apple: "/images/choice-features/open-browser.png",
    },
  };
}
