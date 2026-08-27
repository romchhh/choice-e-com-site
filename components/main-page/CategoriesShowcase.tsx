"use client";

import { useRef, useState, useEffect } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Image from "next/image";
import { useCategories } from "@/lib/CategoriesProvider";
import { localizedLabel } from "@/lib/i18n/localizeCatalog";

function CategoriesLoadingPlaceholder() {
  const { dict } = useLocale();
  return (
    <section className="w-full bg-[#FFFFFF] py-12 lg:py-16">
      <div className="max-w-[1920px] mx-auto px-6">
        <p className="text-[#3D1A00] font-['Montserrat']">{dict.common.loading}</p>
      </div>
    </section>
  );
}

export default function CategoriesShowcase() {
  const { dict, locale } = useLocale();
  const { categories, loading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  };

  if (!mounted || loading) {
    return <CategoriesLoadingPlaceholder />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full bg-[#FFFFFF]"
      aria-labelledby="home-categories-heading"
    >
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
          <div className="min-w-0 max-w-2xl">
            <h2
              id="home-categories-heading"
              className="text-2xl font-bold font-['Montserrat'] uppercase tracking-tight text-[#3D1A00] lg:text-3xl"
            >
              {dict.home.categories}
            </h2>
            <p className="mt-2 font-['Montserrat'] text-sm text-[#3D1A00]/70 md:text-base">
              {dict.home.categoriesLead}
            </p>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-2 text-[#3D1A00] transition-opacity hover:opacity-70"
              aria-label="Прокрутити вліво"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-2 text-[#3D1A00] transition-opacity hover:opacity-70"
              aria-label="Прокрутити вправо"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:gap-5 sm:overflow-x-auto sm:scroll-smooth sm:pb-2 sm:scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((category) => {
            const label = localizedLabel(category, locale);
            return (
              <LocaleLink
                key={category.id}
                href={`/catalog?categoryId=${category.id}`}
                className="group w-full min-w-0 sm:w-[30%] sm:flex-shrink-0 md:w-[22%] lg:w-[calc((100%-3.75rem)/5)]"
                aria-label={`${dict.catalog.category}: ${label}`}
              >
                <div className="relative mb-2.5 aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-200">
                  {category.mediaUrl && category.mediaType ? (
                    category.mediaType === "video" ? (
                      <video
                        src={`/api/images/${category.mediaUrl}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={`/api/images/${category.mediaUrl}`}
                        alt={label}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 18vw"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gray-200" aria-hidden />
                  )}
                </div>
                <p className="line-clamp-2 text-left font-['Montserrat'] text-sm font-semibold leading-snug text-[#3D1A00] lg:text-base">
                  {label}
                </p>
              </LocaleLink>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end lg:mt-10">
          <LocaleLink
            href="/catalog"
            className="inline-flex items-center gap-1 font-['Montserrat'] font-semibold text-[#8B9A47] transition-opacity hover:opacity-80"
          >
            {dict.home.allCatalog}
            <span aria-hidden>→</span>
          </LocaleLink>
        </div>
      </div>
    </section>
  );
}
