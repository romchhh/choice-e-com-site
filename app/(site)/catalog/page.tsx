import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { getLocale } from "@/lib/i18n/getLocale";
import { buildSeoMetadata, catalogSeoCopy } from "@/lib/i18n/seo";
import { sqlGetAllProducts } from "@/lib/sql";

export const revalidate = 1200; // ISR every 20 minutes

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
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

export default async function CatalogPage() {
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
      <CatalogServer category={null} subcategory={null} />
    </Suspense>
  );
}
