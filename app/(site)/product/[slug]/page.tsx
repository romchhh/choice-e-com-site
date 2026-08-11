import ProductServer from "@/components/product/ProductServer";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProductBySlug, sqlGetProduct, sqlGetAllProducts } from "@/lib/sql";
import { SITE_PRODUCT_BRAND, SITE_STORE_NAME } from "@/lib/siteBrand";
import { getDiscountedPrice } from "@/lib/pricing";
import { redirect, notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeProductFields, localizeList } from "@/lib/i18n/localizeCatalog";
import { localePath } from "@/lib/i18n/paths";
import { buildSeoMetadata, productSeoCopy } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1200; // ISR every 20 minutes

export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return products
      .filter((p: { slug: string | null }): p is { slug: string } => p.slug != null)
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
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
  const imageUrl = firstMedia
    ? `/api/images/${firstMedia.url}`
    : undefined;
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

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const slugStr = typeof slug === "string" ? slug.trim() : "";
  if (!slugStr) notFound();

  let product = await sqlGetProductBySlug(slugStr);
  if (!product && /^\d+$/.test(slugStr)) {
    product = await sqlGetProduct(Number(slugStr));
    if (product?.slug) {
      redirect(localePath(`/product/${product.slug}`, locale));
    }
  }
  if (!product) {
    notFound();
  }

  product = localizeProductFields(product, locale);

  const boughtTogetherIds = Array.isArray((product as any).bought_together_ids)
    ? ((product as any).bought_together_ids as number[])
    : [];

  const pairTogetherIds = Array.isArray((product as any).pair_together_ids)
    ? ((product as any).pair_together_ids as number[])
    : [];

  // Схожі товари — спочатку з тієї ж підкатегорії, потім з тієї ж категорії, потім інші випадкові
  const allProducts = localizeList(await sqlGetAllProducts(), locale, "product");
  const others = allProducts.filter((p) => p.id !== product.id);

  // Допоміжний шифл
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
        ...(((product as any).category_id != null ? [(product as any).category_id as number] : []) as number[]),
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
          ...(((p as any).subcategory_id != null ? [(p as any).subcategory_id as number] : []) as number[]),
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
      currentSubId != null && (pSubIds.has(currentSubId) || (p as any).subcategory_id === currentSubId);
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

  const suggestedProducts = ordered.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    price: p.price,
    first_media: p.first_media ?? null,
  }));

  const boughtTogetherProducts = boughtTogetherIds.length
    ? allProducts
        .filter((p) => boughtTogetherIds.includes(p.id))
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug ?? null,
          price: p.price,
          first_media: p.first_media ?? null,
          description: (p as any).description ?? null,
        }))
    : [];

  const pairProducts = pairTogetherIds.length
    ? allProducts
        .filter((p) => pairTogetherIds.includes(p.id))
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug ?? null,
          price: p.price,
          first_media: p.first_media ?? null,
          description: (p as any).description ?? null,
        }))
    : [];

  // Прокидаємо на клієнт (ProductClient) для блоку "Купують разом"
  (product as any).bought_together_products = boughtTogetherProducts;

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <Suspense fallback={<div className="text-center py-20 text-lg">{dict.common.loading}</div>}>
        <ProductServer product={product} />
      </Suspense>
      <YouMightLike title={dict.common.similarProducts} suggestedProducts={suggestedProducts} />
      {pairProducts.length > 0 && (
        <YouMightLike title={dict.common.chooseInPair} suggestedProducts={pairProducts} />
      )}
    </main>
  );
}
