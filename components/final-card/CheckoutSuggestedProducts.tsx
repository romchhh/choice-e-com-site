"use client";

import { useMemo, useRef, useState } from "react";
import CatalogStyleProductCard, {
  type CatalogStyleProduct,
} from "@/components/product/CatalogStyleProductCard";
import { useBasket } from "@/lib/BasketProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeList, localizedLabel } from "@/lib/i18n/localizeCatalog";
import { useProducts } from "@/lib/useProducts";

type Props = {
  excludeIds: number[];
};

export default function CheckoutSuggestedProducts({ excludeIds }: Props) {
  const { dict, locale } = useLocale();
  const numberLocale = locale === "ru" ? "ru-RU" : "uk-UA";
  const { addItem } = useBasket();
  const { products: topSaleProducts, loading: loadingTop } = useProducts({
    topSale: true,
  });
  const { products: allProducts, loading: loadingAll } = useProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const excludeSet = useMemo(() => new Set(excludeIds), [excludeIds]);

  const suggestions = useMemo(() => {
    const top = localizeList(topSaleProducts, locale, "product").filter(
      (p) => !excludeSet.has(p.id)
    ) as CatalogStyleProduct[];
    if (top.length >= 4) return top.slice(0, 8);

    const rest = localizeList(allProducts, locale, "product").filter(
      (p) => !excludeSet.has(p.id) && !top.some((t) => t.id === p.id)
    ) as CatalogStyleProduct[];

    return [...top, ...rest].slice(0, 8);
  }, [topSaleProducts, allProducts, locale, excludeSet]);

  const loading = loadingTop || loadingAll;

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const handleAddToCart = async (
    e: React.MouseEvent,
    product: CatalogStyleProduct
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingId != null) return;
    setAddingId(product.id);
    try {
      const firstMediaUrl =
        product.first_media && "url" in product.first_media
          ? product.first_media.url
          : "";
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "—",
        quantity: 1,
        imageUrl: firstMediaUrl,
        discount_percentage: product.discount_percentage ?? undefined,
      });
      setAddedId(product.id);
      window.setTimeout(() => setAddedId(null), 2500);
    } finally {
      setAddingId(null);
    }
  };

  const cardLabels = {
    addToCart: dict.common.addToCart,
    buyOneClick: dict.common.buyOneClick,
    outOfStock: dict.common.outOfStock,
    loading: dict.common.loading,
    uah: dict.common.uah,
    productPackage: dict.brand.productPackage,
    productCourse: dict.brand.productCourse,
    gift: dict.common.gift,
    promo: dict.common.promo,
    hit: dict.common.hit,
    giftToProduct: dict.common.giftToProduct,
    free: dict.common.free,
    dietitian: dict.common.dietitian,
  };

  if (loading) {
    return (
      <div className="border-t border-[#3D1A00]/10 pt-8">
        <p className="font-['Montserrat'] text-sm text-[#3D1A00]/60">
          {dict.common.loading}
        </p>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-[#3D1A00]/10 pt-8 mt-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-['Montserrat'] text-xl font-bold uppercase tracking-tight text-[#3D1A00] sm:text-2xl">
            {dict.checkout.suggestedTitle}
          </h2>
          <p className="mt-1.5 font-['Montserrat'] text-sm text-[#3D1A00]/65">
            {dict.checkout.suggestedLead}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
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
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide sm:gap-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {suggestions.map((product, index) => {
          const giftLocalized = product.gift_product
            ? {
                ...product.gift_product,
                name: localizedLabel(product.gift_product, locale),
              }
            : null;

          return (
            <CatalogStyleProductCard
              key={product.id}
              product={{ ...product, gift_product: giftLocalized }}
              index={index}
              numberLocale={numberLocale}
              adding={addingId === product.id}
              onAddToCart={handleAddToCart}
              onOneClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              labels={cardLabels}
              className="w-[11.5rem] flex-shrink-0 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
              footerExtra={
                addedId === product.id ? (
                  <p className="px-3 pb-3 text-center font-['Montserrat'] text-xs font-medium text-[#5F6B2E]">
                    {dict.checkout.suggestedAdded}
                  </p>
                ) : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
