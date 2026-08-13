import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildCatalogMetadata } from "@/lib/i18n/pages/catalogMeta";

export const revalidate = 1200;

export async function generateMetadata(): Promise<Metadata> {
  return buildCatalogMetadata(LOCALE_UK);
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
      <CatalogServer locale={LOCALE_UK} category={null} subcategory={null} />
    </Suspense>
  );
}
