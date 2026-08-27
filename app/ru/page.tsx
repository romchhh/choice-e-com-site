import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import CategoriesShowcase from "@/components/main-page/CategoriesShowcase";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildHomeMetadata } from "@/lib/i18n/pages/homeMeta";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveHeroBanners } from "@/lib/heroBanners.server";
import { localizeHeroBanner } from "@/lib/heroBanners";

export const revalidate = 60;
export const runtime = "nodejs";

const Bestsellers = dynamic(() => import("@/components/main-page/Bestsellers"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFFFFF]" />,
});
const NewArrivals = dynamic(() => import("@/components/main-page/NewArrivals"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" />,
});
const Promotions = dynamic(() => import("@/components/main-page/Promotions"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFFFFF]" />,
});
const AboutChoiceSection = dynamic(
  () => import("@/components/main-page/AboutChoiceSection"),
  { loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" /> }
);
const WhyForBodySection = dynamic(
  () => import("@/components/main-page/WhyForBodySection"),
  { loading: () => <div className="h-48 animate-pulse bg-white" /> }
);
const HomeReviews = dynamic(() => import("@/components/main-page/HomeReviews"), {
  loading: () => <div className="h-64 animate-pulse bg-[#FFF9F0]" />,
});

export function generateMetadata(): Metadata {
  return buildHomeMetadata(LOCALE_RU);
}

export default async function RuHome() {
  const dict = getDictionary(LOCALE_RU);
  const banners = await getActiveHeroBanners();
  const slides = banners.map((b) => localizeHeroBanner(b, LOCALE_RU));

  return (
    <>
      <Hero slides={slides} />
      <Suspense
        fallback={
          <section className="w-full bg-[#FFF9F0] py-8 lg:py-10">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12">
              <p className="text-[#3D1A00] font-['Montserrat'] text-sm">{dict.common.loading}</p>
            </div>
          </section>
        }
      >
        <CategoriesShowcase />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#FFFFFF] animate-pulse" />}>
        <Bestsellers />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#FFF9F0] animate-pulse" />}>
        <NewArrivals />
      </Suspense>
      <Suspense fallback={<div className="h-64 bg-[#FFFFFF] animate-pulse" />}>
        <Promotions />
      </Suspense>
      <AboutChoiceSection />
      <Suspense fallback={<div className="h-64 bg-[#FFF9F0] animate-pulse" />}>
        <HomeReviews />
      </Suspense>
      <WhyForBodySection />
    </>
  );
}
