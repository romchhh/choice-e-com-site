import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Hero from "@/components/main-page/Hero";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildSeoMetadata } from "@/lib/i18n/seo";

// Lazy load components that are below the fold
const Bestsellers = dynamic(() => import("@/components/main-page/Bestsellers"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" />,
});
const AboutChoiceSection = dynamic(
  () => import("@/components/main-page/AboutChoiceSection"),
  { loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" /> }
);
const FeaturesSection = dynamic(
  () => import("@/components/main-page/FeaturesSection"),
  { loading: () => <div className="h-32 animate-pulse bg-white" /> }
);

export const revalidate = 300;
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return buildSeoMetadata({
    locale,
    path: "/",
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    ogType: "website",
    imageAlt: dict.hero.imageAlt,
  });
}

export default function Home() {
  return (
    <>
      <Hero />

      <Suspense
        fallback={
          <section className="w-full bg-[#FFFFFF] py-16 lg:py-20">
            <div className="max-w-[1920px] mx-auto px-6">
              <p className="text-[#3D1A00] font-['Montserrat']">Завантаження категорій...</p>
            </div>
          </section>
        }
      >
        <CategoriesShowcase />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-[#FFFFFF] animate-pulse" />}>
        <Bestsellers />
      </Suspense>

      <AboutChoiceSection />

      <FeaturesSection />
    </>
  );
}
