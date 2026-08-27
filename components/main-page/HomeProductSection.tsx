"use client";

import { useMemo, useRef, useState } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useProducts } from "@/lib/useProducts";
import { localizeList, localizedLabel } from "@/lib/i18n/localizeCatalog";
import { useBasket } from "@/lib/BasketProvider";
import { useAppContext } from "@/lib/GeneralProvider";
import CartAlert from "@/components/shared/CartAlert";
import Alert from "@/components/shared/Alert";
import OneClickOrderModal from "@/components/product/OneClickOrderModal";
import CatalogStyleProductCard, {
  type CatalogStyleProduct,
} from "@/components/product/CatalogStyleProductCard";

export type HomeProduct = CatalogStyleProduct;

type Props = {
  mode: "bestsellers" | "newArrivals" | "promos";
  title: string;
  lead?: string;
  catalogHref?: string;
  catalogLabel?: string;
  tone?: "white" | "cream";
  limit?: number;
};

export default function HomeProductSection({
  mode,
  title,
  lead,
  catalogHref,
  catalogLabel,
  tone = "white",
  limit = 8,
}: Props) {
  const { dict, locale } = useLocale();
  const numberLocale = locale === "ru" ? "ru-RU" : "uk-UA";
  const { addItem } = useBasket();
  const { setIsBasketOpen } = useAppContext();
  const { products, loading } = useProducts(
    mode === "bestsellers"
      ? { topSale: true }
      : mode === "newArrivals"
        ? { limitedEdition: true }
        : { promo: true }
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () =>
      localizeList(products, locale, "product").slice(0, limit) as HomeProduct[],
    [products, locale, limit]
  );

  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [oneClickProduct, setOneClickProduct] = useState<HomeProduct | null>(
    null
  );

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
    setAlertMessage(null);
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
      setShowCartAlert(true);
      setTimeout(() => setShowCartAlert(false), 4000);
    } catch (err) {
      setAlertMessage(
        err instanceof Error ? err.message : dict.catalog.stockInsufficient
      );
      setTimeout(() => setAlertMessage(null), 4000);
    } finally {
      setAddingId(null);
    }
  };

  const handleOneClick = (e: React.MouseEvent, product: CatalogStyleProduct) => {
    e.preventDefault();
    e.stopPropagation();
    setOneClickProduct(product);
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
    doctorChoice: dict.common.doctorChoice,
  };

  const bg = tone === "cream" ? "bg-[#FFF9F0]" : "bg-[#FFFFFF]";

  if (loading) {
    return (
      <section className={`w-full ${bg} py-12 lg:py-16`}>
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
          <p className="text-[#3D1A00] font-['Montserrat'] text-sm">
            {dict.common.loading}
          </p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`w-full ${bg}`} aria-labelledby={`home-${mode}-heading`}>
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
          <div className="min-w-0 max-w-2xl">
            <h2
              id={`home-${mode}-heading`}
              className="text-2xl font-bold uppercase tracking-tight text-[#3D1A00] font-['Montserrat'] lg:text-3xl"
            >
              {title}
            </h2>
            {lead ? (
              <p className="mt-2 font-['Montserrat'] text-sm text-[#3D1A00]/70 md:text-base">
                {lead}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {catalogHref && catalogLabel ? (
              <LocaleLink
                href={catalogHref}
                className="hidden sm:inline font-['Montserrat'] text-sm font-semibold text-[#8B9A47] transition-opacity hover:opacity-80 md:text-base"
              >
                {catalogLabel}
                <span aria-hidden> →</span>
              </LocaleLink>
            ) : null}
            <div className="flex items-center gap-1">
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
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {items.map((product, index) => {
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
                onOneClick={handleOneClick}
                labels={cardLabels}
                className="w-[calc((100%-1.5rem)/2)] flex-shrink-0 lg:w-[calc((100%-4.5rem)/4)]"
              />
            );
          })}
        </div>

        {catalogHref && catalogLabel ? (
          <div className="mt-6 flex justify-end sm:hidden">
            <LocaleLink
              href={catalogHref}
              className="font-['Montserrat'] text-sm font-semibold text-[#8B9A47]"
            >
              {catalogLabel}
              <span aria-hidden> →</span>
            </LocaleLink>
          </div>
        ) : null}
      </div>

      <CartAlert
        isVisible={showCartAlert}
        onGoToCart={() => {
          setShowCartAlert(false);
          setIsBasketOpen(true);
        }}
      />
      <Alert
        type="error"
        message={alertMessage || ""}
        isVisible={!!alertMessage}
        onClose={() => setAlertMessage(null)}
      />
      {oneClickProduct && (
        <OneClickOrderModal
          open={!!oneClickProduct}
          onClose={() => setOneClickProduct(null)}
          product={{
            id: oneClickProduct.id,
            name: oneClickProduct.name,
            price: oneClickProduct.price,
            discount_percentage: oneClickProduct.discount_percentage,
            in_stock: oneClickProduct.in_stock,
            stock: oneClickProduct.stock,
          }}
          quantity={1}
        />
      )}
    </section>
  );
}
