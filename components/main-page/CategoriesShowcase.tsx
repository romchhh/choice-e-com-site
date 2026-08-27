"use client";

import { useState, useEffect } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Image from "next/image";
import { useCategories } from "@/lib/CategoriesProvider";
import { localizedLabel } from "@/lib/i18n/localizeCatalog";

function CategoriesLoadingPlaceholder() {
  const { dict } = useLocale();
  return (
    <section className="w-full bg-[#FFFFFF] py-8 lg:py-10">
      <div className="mx-auto max-w-[1920px] px-6">
        <p className="font-['Montserrat'] text-[#3D1A00]">{dict.common.loading}</p>
      </div>
    </section>
  );
}

export default function CategoriesShowcase() {
  const { dict, locale } = useLocale();
  const { categories, loading } = useCategories();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!mounted || loading) {
    return <CategoriesLoadingPlaceholder />;
  }

  if (categories.length === 0) {
    return null;
  }

  const mobileColumns = Math.max(2, Math.ceil(categories.length / 2));
  const desktopColumns = categories.length;
  const columns = isDesktop ? desktopColumns : mobileColumns;

  return (
    <section
      className="w-full bg-[#FFFFFF]"
      aria-labelledby="home-categories-heading"
    >
      <div className="mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-5">
          <div className="min-w-0 max-w-2xl">
            <h2
              id="home-categories-heading"
              className="font-['Montserrat'] text-xl font-bold uppercase tracking-tight text-[#3D1A00] sm:text-2xl lg:text-3xl"
            >
              {dict.home.categories}
            </h2>
            <p className="mt-1.5 font-['Montserrat'] text-xs text-[#3D1A00]/70 sm:text-sm md:text-base">
              {dict.home.categoriesLead}
            </p>
          </div>
          <LocaleLink
            href="/catalog"
            className="inline-flex shrink-0 items-center gap-1 font-['Montserrat'] text-sm font-semibold text-[#8B9A47] transition-opacity hover:opacity-80"
          >
            {dict.home.allCatalog}
            <span aria-hidden>→</span>
          </LocaleLink>
        </div>

        <div
          className={`grid w-full gap-2.5 sm:gap-3 ${
            isDesktop ? "grid-flow-row" : "grid-rows-2 grid-flow-col"
          } lg:gap-2`}
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {categories.map((category) => {
            const label = localizedLabel(category, locale);
            return (
              <LocaleLink
                key={category.id}
                href={`/catalog?categoryId=${category.id}`}
                className="group min-w-0"
                aria-label={`${dict.catalog.category}: ${label}`}
              >
                <div className="relative mb-1.5 aspect-square w-full overflow-hidden rounded-md bg-gray-200 sm:mb-2 lg:mb-1">
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
                        sizes={`(max-width: 640px) ${Math.round(100 / columns)}vw, ${Math.round(100 / columns)}vw`}
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gray-200" aria-hidden />
                  )}
                </div>
                <p className="line-clamp-2 text-left font-['Montserrat'] text-xs font-semibold leading-snug text-[#3D1A00] sm:text-sm lg:text-[11px] lg:leading-tight">
                  {label}
                </p>
              </LocaleLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
