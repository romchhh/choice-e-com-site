import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { sqlGetAllProducts } from "@/lib/sql";
import { buildSeoMetadata, catalogSeoCopy } from "@/lib/i18n/seo";

export async function buildCatalogMetadata(locale: Locale): Promise<Metadata> {
  let productCount: number | null = null;
  try {
    const products = await sqlGetAllProducts();
    productCount = products.length;
  } catch {
    /* ignore */
  }
  const copy = catalogSeoCopy(locale, { productCount });
  return buildSeoMetadata({
    locale,
    path: "/catalog",
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    ogType: "website",
    imageAlt: copy.ogTitle,
  });
}
