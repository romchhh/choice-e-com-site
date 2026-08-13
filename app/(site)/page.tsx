import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import Hero from "@/components/main-page/Hero";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildHomeMetadata } from "@/lib/i18n/pages/homeMeta";
import { getDictionary } from "@/lib/i18n/dictionaries";

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

export function generateMetadata(): Metadata {
  return buildHomeMetadata(LOCALE_UK);
}

export default function Home() {
  const dict = getDictionary(LOCALE_UK);

  return (
    <>
      <Hero />

      <Suspense
        fallback={
          <section className="w-full bg-[#FFFFFF] py-16 lg:py-20">
            <div className="max-w-[1920px] mx-auto px-6">
              <p className="text-[#3D1A00] font-['Montserrat']">{dict.common.loading}</p>
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
