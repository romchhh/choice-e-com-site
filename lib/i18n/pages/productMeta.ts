import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { sqlGetProductBySlug, sqlGetProduct } from "@/lib/sql";
import { getDiscountedPrice } from "@/lib/pricing";
import { localizeProductFields } from "@/lib/i18n/localizeCatalog";
import { buildSeoMetadata, productSeoCopy } from "@/lib/i18n/seo";

export async function buildProductMetadata(
  locale: Locale,
  slug: string
): Promise<Metadata> {
  let product = await sqlGetProductBySlug(slug);
  if (!product && /^\d+$/.test(slug)) {
    product = await sqlGetProduct(Number(slug));
  }
  if (!product) {
    return {
      title:
        locale === "ru"
          ? `Товар не найден | ${SITE_STORE_NAME}`
          : `Товар не знайдено | ${SITE_STORE_NAME}`,
      robots: { index: false, follow: true },
    };
  }

  product = localizeProductFields(product, locale);

  const canonicalSlug = product.slug || String(product.id);
  const firstMedia = product.media?.length ? product.media[0] : null;
  const imageUrl = firstMedia ? `/api/images/${firstMedia.url}` : undefined;
  const price = getDiscountedPrice(
    Number(product.price),
    product.discount_percentage
  ).toFixed(0);
  const copy = productSeoCopy(locale, product, price);

  return buildSeoMetadata({
    locale,
    path: `/product/${canonicalSlug}`,
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    ogType: "product",
    image: imageUrl,
    imageAlt: product.name,
  });
}
