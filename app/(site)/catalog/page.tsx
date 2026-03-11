import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";

export const revalidate = 1200; // ISR every 20 minutes

export const metadata: Metadata = {
  title: "Каталог wellness та eco-продукції | Choice",
  description:
    "Перегляньте повний каталог wellness-комплексів, фітопрепаратів, натурального догляду та eco-засобів для дому від Choice. Підберіть продукти для здоров'я, енергії та комфорту щодня.",
  keywords:
    "Choice, каталог продукції, wellness, фітокомплекси, вітаміни, натуральний догляд, eco-засоби для дому, здоров'я, імунітет, детокс, енергія",
  openGraph: {
    title: "Каталог wellness та eco-продукції | Choice",
    description:
      "Wellness-комплекси, фітопрепарати, натуральний догляд і eco-засоби для дому від Choice. Оберіть рішення для вашого здоров'я та комфорту.",
    type: "website",
    locale: "uk_UA",
    url: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/catalog`,
    images: [
      {
        url: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: "Choice — каталог wellness та eco-продукції",
      },
    ],
    siteName: "Choice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Каталог wellness та eco-продукції | Choice",
    description:
      "Перегляньте каталог wellness та eco-продукції Choice: фітокомплекси, природна підтримка організму та засоби для здорового дому.",
    images: [
      `${
        process.env.PUBLIC_URL ||
        process.env.NEXT_PUBLIC_PUBLIC_URL ||
        "http://localhost:3000"
      }/images/tg_image_3614117882.png`,
    ],
  },
  alternates: {
    canonical: `${process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000"}/catalog`,
  },
};

export default async function CatalogPage() {
  return (
    <Suspense fallback={
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
            Завантаження...
          </h1>
        </div>
        <CatalogGridSkeleton count={12} />
      </section>
    }>
      <CatalogServer 
        category={null}
        subcategory={null}
      />
    </Suspense>
  );
}