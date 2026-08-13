import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { sqlGetCategoryBySlug } from "@/lib/sql";
import { notFound } from "next/navigation";
import { localizeCategoryFields } from "@/lib/i18n/localizeCatalog";
import { buildCatalogSlugMetadata } from "@/lib/i18n/pages/catalogSlugMeta";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function buildCatalogSlugPageMetadata(
  locale: Locale,
  params: PageProps["params"]
): Promise<Metadata> {
  const { slug } = await params;
  return buildCatalogSlugMetadata(locale, slug);
}

export async function CatalogSlugPageContent({
  locale,
  params,
}: PageProps & { locale: Locale }) {
  const { slug } = await params;
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
        locale={locale}
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
