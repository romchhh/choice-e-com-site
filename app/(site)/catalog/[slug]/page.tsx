import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { sqlGetAllCategories, sqlGetCategoryBySlug } from "@/lib/sql";
import { notFound } from "next/navigation";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { getLocale } from "@/lib/i18n/getLocale";
import { localizeCategoryFields } from "@/lib/i18n/localizeCatalog";
import { buildSeoMetadata, catalogSeoCopy } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1200;

export async function generateStaticParams() {
  try {
    const categories = await sqlGetAllCategories();
    return categories
      .filter((c) => c.slug != null)
      .map((c) => ({ slug: c.slug! }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
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
  const copy = catalogSeoCopy(locale, category.name);
  const descFromCategory = category.description
    ? String(category.description).replace(/<[^>]*>/g, " ").trim()
    : null;

  return buildSeoMetadata({
    locale,
    path: `/catalog/${slug}`,
    title: copy.title,
    description: descFromCategory
      ? `${descFromCategory.slice(0, 140)}${descFromCategory.length > 140 ? "…" : ""}`
      : copy.description,
    keywords: copy.keywords,
    ogType: "website",
    imageAlt: `${SITE_STORE_NAME} — ${category.name}`,
  });
}

export default async function CatalogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const categoryRaw = await sqlGetCategoryBySlug(slug);
  if (!categoryRaw) notFound();
  const category = localizeCategoryFields(categoryRaw, locale);

  return (
    <Suspense
      fallback={
        <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
              …
            </h1>
          </div>
          <CatalogGridSkeleton count={12} />
        </section>
      }
    >
      <CatalogServer
        category={categoryRaw.name}
        subcategory={null}
        categoryId={category.id}
        categorySlug={slug}
        categoryDescription={
          (category as { description?: string | null }).description ?? null
        }
      />
    </Suspense>
  );
}
