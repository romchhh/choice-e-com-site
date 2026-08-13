import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import {
  sqlGetCategoryBySlug,
  sqlGetProductsByCategory,
} from "@/lib/sql";
import { localizeCategoryFields } from "@/lib/i18n/localizeCatalog";
import { buildSeoMetadata, catalogSeoCopy, getSiteOrigin } from "@/lib/i18n/seo";

export async function buildCatalogSlugMetadata(
  locale: Locale,
  slug: string
): Promise<Metadata> {
  const categoryRaw = await sqlGetCategoryBySlug(slug);
  if (!categoryRaw) {
    return {
      title:
        locale === "ru"
          ? `Категория не найдена | ${SITE_STORE_NAME}`
          : `Категорія не знайдена | ${SITE_STORE_NAME}`,
      robots: { index: false, follow: true },
    };
  }

  const category = localizeCategoryFields(categoryRaw, locale);
  let productCount: number | null = null;
  try {
    const products = await sqlGetProductsByCategory(categoryRaw.name);
    productCount = products.length;
  } catch {
    /* ignore */
  }

  const copy = catalogSeoCopy(locale, {
    categoryName: category.name,
    categoryDescription: (category as { description?: string | null }).description,
    productCount,
  });

  const origin = getSiteOrigin();
  const ogImage = (categoryRaw as { mediaUrl?: string | null }).mediaUrl
    ? `${origin}/api/images/${(categoryRaw as { mediaUrl?: string | null }).mediaUrl}`
    : undefined;

  return buildSeoMetadata({
    locale,
    path: `/catalog/${slug}`,
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    ogType: "website",
    image: ogImage,
    imageAlt: copy.ogTitle,
  });
}
