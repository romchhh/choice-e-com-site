import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import ProductReviewsTab from "@/components/product/ProductReviewsTab";
import { toCatalogStyleProduct } from "@/lib/catalogStyleProduct";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { sqlGetProductBySlug, sqlGetProduct, sqlGetAllProducts } from "@/lib/sql";
import { redirect, notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeProductFields, localizeList } from "@/lib/i18n/localizeCatalog";
import { localePath } from "@/lib/i18n/paths";
import { buildProductMetadata } from "@/lib/i18n/pages/productMeta";
import { isSlugSafeForStaticGeneration } from "@/lib/slug";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function buildProductPageMetadata(
  locale: Locale,
  params: PageProps["params"]
): Promise<Metadata> {
  const { slug } = await params;
  return buildProductMetadata(locale, slug);
}

export async function ProductPageContent({
  locale,
  params,
}: PageProps & { locale: Locale }) {
  const { slug } = await params;
  const dict = getDictionary(locale);
  const slugStr = typeof slug === "string" ? slug.trim() : "";
  if (!slugStr) notFound();

  let product = await sqlGetProductBySlug(slugStr);
  if (!product && /^\d+$/.test(slugStr)) {
    product = await sqlGetProduct(Number(slugStr));
    if (
      product?.slug &&
      isSlugSafeForStaticGeneration(product.slug) &&
      product.slug !== slugStr
    ) {
      redirect(localePath(`/product/${product.slug}`, locale));
    }
  }
  if (!product) {
    notFound();
  }

  if (!isSlugSafeForStaticGeneration(slugStr)) {
    redirect(localePath(`/product/${product.id}`, locale));
  }

  product = localizeProductFields(product, locale);

  const boughtTogetherIds = Array.isArray((product as any).bought_together_ids)
    ? ((product as any).bought_together_ids as number[])
    : [];

  const pairTogetherIds = Array.isArray((product as any).pair_together_ids)
    ? ((product as any).pair_together_ids as number[])
    : [];

  const allProducts = localizeList(await sqlGetAllProducts(), locale, "product");
  const others = allProducts.filter((p) => p.id !== product.id);

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const currentSubId = (product as any).subcategory_id as number | null | undefined;
  const currentCatIds = new Set<number>(
    Array.from(
      new Set([
        ...(((product as any).category_ids as number[] | undefined) ?? []),
        ...(((product as any).category_id != null
          ? [(product as any).category_id as number]
          : []) as number[]),
      ])
    )
  );

  const sameSubcategory: typeof others = [];
  const sameCategory: typeof others = [];
  const rest: typeof others = [];

  for (const p of others) {
    const pSubIds = new Set<number>(
      Array.from(
        new Set([
          ...(((p as any).subcategory_ids as number[] | undefined) ?? []),
          ...(((p as any).subcategory_id != null
            ? [(p as any).subcategory_id as number]
            : []) as number[]),
        ])
      )
    );

    const pCatIds = new Set<number>(
      Array.from(
        new Set([
          ...(((p as any).category_ids as number[] | undefined) ?? []),
          ...(((p as any).category_id != null ? [(p as any).category_id as number] : []) as number[]),
        ])
      )
    );

    const sharedSub =
      currentSubId != null &&
      (pSubIds.has(currentSubId) || (p as any).subcategory_id === currentSubId);
    const sharedCat =
      currentCatIds.size > 0 && [...pCatIds].some((id) => currentCatIds.has(id));

    if (sharedSub) {
      sameSubcategory.push(p);
    } else if (sharedCat) {
      sameCategory.push(p);
    } else {
      rest.push(p);
    }
  }

  const ordered = [
    ...shuffle(sameSubcategory),
    ...shuffle(sameCategory),
    ...shuffle(rest),
  ].slice(0, 8);

  const mapRailProduct = (p: (typeof allProducts)[number]) =>
    toCatalogStyleProduct(p);

  const suggestedProducts = ordered.map(mapRailProduct);

  const boughtTogetherProducts = boughtTogetherIds.length
    ? allProducts
        .filter((p) => boughtTogetherIds.includes(p.id))
        .slice(0, 12)
        .map(mapRailProduct)
    : [];

  const pairProducts = pairTogetherIds.length
    ? allProducts
        .filter((p) => pairTogetherIds.includes(p.id))
        .slice(0, 12)
        .map(mapRailProduct)
    : [];

  (product as any).bought_together_products = boughtTogetherProducts;

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Suspense fallback={<div className="text-center py-20 text-lg">{dict.common.loading}</div>}>
        <ProductServer product={product} locale={locale} />
      </Suspense>
      <YouMightLike title={dict.common.similarProducts} suggestedProducts={suggestedProducts} />
      {pairProducts.length > 0 && (
        <YouMightLike title={dict.common.chooseInPair} suggestedProducts={pairProducts} />
      )}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 pb-12 lg:pb-16">
        <ProductReviewsTab productId={product.id} />
      </div>
    </main>
  );
}
