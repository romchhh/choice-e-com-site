"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";
import Image from "next/image";
import Link from "next/link";
import { SITE_PRODUCT_BRAND, SITE_STORE_NAME } from "@/lib/siteBrand";

const HERO_IMAGE_DESKTOP =
  "/images/hf_20260222_063745_3c9c7bbc-82d2-4f3f-8c11-4216792e4995.jpeg";
const HERO_IMAGE_MOBILE = "/images/tg_image_3018005591.jpg";

export default function Hero() {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();

  return (
    <section id="hero" className="relative">
      <div className="max-w-[1920px] mx-auto w-full h-screen relative overflow-hidden">
        {/* Hero image — mobile */}
        <Image
          src={HERO_IMAGE_MOBILE}
          alt={`${SITE_STORE_NAME} — eco та wellness`}
          fill
          className="object-cover object-center sm:hidden"
          priority
          sizes="100vw"
        />

        {/* Hero image — desktop */}
        <Image
          src={HERO_IMAGE_DESKTOP}
          alt={`${SITE_STORE_NAME} — eco та wellness`}
          fill
          className="hidden sm:block object-cover object-right"
          priority
          sizes="(max-width: 1024px) 100vw, 100vw"
        />

        {/* Subtle darkening overlay (no blur) */}
        <div
          className="absolute inset-0 bg-black/20 pointer-events-none z-[1]"
          aria-hidden
        />

        {/* Slight gradient at the bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-[1]"
          aria-hidden
        />

        <div
          className="relative z-10 flex flex-col justify-center items-start gap-8 md:gap-12 h-full min-h-screen max-w-[1920px] mx-auto px-10 pb-10 md:px-16 md:pb-16 lg:px-20 lg:pb-20 pt-[var(--site-header-offset)] max-lg:justify-start max-lg:pb-20"
        >
          {/* Headline & subheadline — зліва */}
          <div className="flex flex-col items-start gap-5 md:gap-7 max-w-2xl">
            <h1
              className="text-white text-left drop-shadow-md"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 500,
                fontSize: "clamp(38px, 5.5vw, 64px)",
                lineHeight: "159%",
                letterSpacing: "-0.02em",
              }}
            >
              {SITE_STORE_NAME} — eco та wellness для здоров&apos;я і дому
            </h1>
            <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-['Montserrat'] text-left opacity-90 max-w-xl drop-shadow-md" style={{ letterSpacing: "0.02em" }}>
              Інтернет-магазин офіційного представника бренду {SITE_PRODUCT_BRAND}: wellness-комплекси, натуральний догляд та eco-засоби для щоденного життя.
            </p>
          </div>

          {/* CTA buttons — на мобільному на всю ширину з однаковими відступами */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 w-full sm:w-auto max-w-2xl">
            <Link
              href="/catalog"
              className="cursor-pointer w-full sm:w-52 md:w-60 h-12 md:h-14 p-2 bg-[#D7D799] text-[#3D1A00] inline-flex justify-center items-center gap-2 hover:opacity-90 transition-all duration-300 font-['Montserrat'] font-semibold"
            >
              <span className="text-center text-sm sm:text-base md:text-lg">Підібрати програму</span>
            </Link>
            <Link
              href="/info#partnership"
              className="cursor-pointer w-full sm:w-52 md:w-60 h-12 md:h-14 p-2 bg-transparent border-2 border-white text-white inline-flex justify-center items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 font-['Montserrat'] font-semibold"
            >
              <span className="text-center text-sm sm:text-base md:text-lg">Стати партнером</span>
            </Link>
          </div>
        </div>
      </div>

      <SidebarMenu
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </section>
  );
}
