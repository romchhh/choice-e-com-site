"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import ExpandableProductName from "@/components/shared/ExpandableProductName";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useProducts } from "@/lib/useProducts";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { localizeList } from "@/lib/i18n/localizeCatalog";
import { catalogProductWord } from "@/lib/i18n/plural";
import { getProductPriceDisplay } from "@/lib/pricing";
import {
  filterProductsByQuery,
  sortSearchProducts,
  type SearchSort,
} from "@/lib/searchProducts";
import { localePath } from "@/lib/i18n/paths";

type Product = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  top_sale?: boolean;
  priority?: number;
  first_media?: { type: string; url: string } | null;
  description?: string | null;
};

const SORT_OPTIONS: SearchSort[] = [
  "relevance",
  "popular",
  "price_asc",
  "price_desc",
  "name",
];

export default function SearchPageClient() {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialSort = (searchParams.get("sort") as SearchSort) || "relevance";

  const [input, setInput] = useState(initialQ);
  const [sort, setSort] = useState<SearchSort>(
    SORT_OPTIONS.includes(initialSort) ? initialSort : "relevance"
  );
  const { products: raw, loading } = useProducts();
  const products = useMemo(
    () =>
      localizeList(
        raw as unknown as Record<string, unknown>[],
        locale,
        "product"
      ) as Product[],
    [raw, locale]
  );

  useEffect(() => {
    setInput(initialQ);
  }, [initialQ]);

  useEffect(() => {
    if (SORT_OPTIONS.includes(initialSort)) setSort(initialSort);
  }, [initialSort]);

  const results = useMemo(() => {
    const filtered = filterProductsByQuery(products, initialQ);
    return sortSearchProducts(filtered, initialQ, sort);
  }, [products, initialQ, sort]);

  const commitSearch = (q: string, nextSort = sort) => {
    const query = q.trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextSort && nextSort !== "relevance") params.set("sort", nextSort);
    const qs = params.toString();
    router.push(localePath(`/search${qs ? `?${qs}` : ""}`, locale));
  };

  const sortLabel = (s: SearchSort) => {
    switch (s) {
      case "popular":
        return dict.searchPage.sortPopular;
      case "price_asc":
        return dict.searchPage.sortPriceAsc;
      case "price_desc":
        return dict.searchPage.sortPriceDesc;
      case "name":
        return dict.searchPage.sortName;
      default:
        return dict.searchPage.sortRelevance;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <h1 className="font-['Montserrat'] text-2xl font-bold uppercase tracking-tight text-[#3D1A00] lg:text-3xl">
          {dict.searchPage.title}
        </h1>

        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            commitSearch(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="h-12 flex-1 rounded-full border-2 border-[#3D1A00]/20 bg-white px-4 font-['Montserrat'] text-[#3D1A00] outline-none focus:border-[#3D1A00]/50"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-[#D7D799] px-6 font-['Montserrat'] text-sm font-semibold uppercase text-[#3D1A00] transition-opacity hover:opacity-90"
          >
            {dict.nav.search}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-['Montserrat'] text-sm text-[#3D1A00]/70">
            {initialQ
              ? `${dict.catalog.found}: ${results.length} ${catalogProductWord(results.length, dict)}`
              : dict.searchPage.emptyQuery}
          </p>
          {initialQ && (
            <label className="flex items-center gap-2 font-['Montserrat'] text-sm text-[#3D1A00]">
              <span className="text-[#3D1A00]/60">{dict.searchPage.sortLabel}</span>
              <select
                value={sort}
                onChange={(e) => {
                  const next = e.target.value as SearchSort;
                  setSort(next);
                  commitSearch(initialQ, next);
                }}
                className="h-10 rounded-full border border-[#3D1A00]/20 bg-white px-3 outline-none"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {sortLabel(s)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-[3/4] bg-[#3D1A00]/10" />
                <div className="h-3 w-3/4 bg-[#3D1A00]/10" />
                <div className="h-3 w-1/3 bg-[#3D1A00]/10" />
              </div>
            ))}
          </div>
        ) : !initialQ ? (
          <p className="mt-10 font-['Montserrat'] text-[#3D1A00]/60">
            {dict.searchPage.emptyQueryHint}
          </p>
        ) : results.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="font-['Montserrat'] text-lg font-medium text-[#3D1A00]">
              {dict.common.noResults}
            </p>
            <p className="mt-2 font-['Montserrat'] text-sm text-[#3D1A00]/60">
              {dict.common.noResultsHint}
            </p>
            <LocaleLink
              href="/catalog"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[#D7D799] px-5 font-['Montserrat'] text-sm font-semibold text-[#3D1A00]"
            >
              {dict.common.continueShopping}
            </LocaleLink>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
            {results.map((product) => {
              const { displayPrice, strikePrice } = getProductPriceDisplay({
                price: product.price,
                old_price: product.old_price,
                discount_percentage: product.discount_percentage,
              });
              return (
                <li key={product.id}>
                  <LocaleLink
                    href={`/product/${product.slug ?? product.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {product.first_media?.url ? (
                        <Image
                          src={getProductImageSrc(product.first_media, "")}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200" />
                      )}
                    </div>
                    <ExpandableProductName
                      name={product.name}
                      variant="search"
                      lines={3}
                      className="mt-2 font-['Montserrat'] text-xs font-semibold leading-snug text-[#3D1A00] sm:text-sm"
                    />
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-['Montserrat'] text-sm font-semibold text-[#3D1A00]">
                        {displayPrice.toLocaleString("uk-UA")} ₴
                      </span>
                      {strikePrice != null && strikePrice > displayPrice && (
                        <span className="font-['Montserrat'] text-xs text-[#3D1A00]/45 line-through">
                          {strikePrice.toLocaleString("uk-UA")} ₴
                        </span>
                      )}
                    </div>
                  </LocaleLink>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
