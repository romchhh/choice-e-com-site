"use client";

import { useMemo, useRef, useState } from "react";
import CatalogStyleProductCard, {
  type CatalogStyleProduct,
} from "@/components/product/CatalogStyleProductCard";
import OneClickOrderModal from "@/components/product/OneClickOrderModal";
import Alert from "@/components/shared/Alert";
import CartAlert from "@/components/shared/CartAlert";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizeList, localizedLabel } from "@/lib/i18n/localizeCatalog";
import { toCatalogStyleProduct } from "@/lib/catalogStyleProduct";
import { useProducts } from "@/lib/useProducts";

export type YouMightLikeProduct = CatalogStyleProduct;

interface YouMightLikeProps {
  suggestedProducts?: YouMightLikeProduct[];
  title?: string;
}

export default function YouMightLike({
  suggestedProducts,
  title,
}: YouMightLikeProps = {}) {
  const { dict, locale } = useLocale();
  const numberLocale = locale === "ru" ? "ru-RU" : "uk-UA";
  const { products: clientProducts, loading } = useProducts();
  const { addItem } = useBasket();
  const { setIsBasketOpen } = useAppContext();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [oneClickProduct, setOneClickProduct] =
    useState<CatalogStyleProduct | null>(null);

  const products = useMemo(() => {
    if (suggestedProducts?.length) {
      return suggestedProducts.slice(0, 8).map((p) => toCatalogStyleProduct(p));
    }
    const localized = localizeList(clientProducts, locale, "product");
    const shuffled = [...localized].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8).map((p) => toCatalogStyleProduct(p));
  }, [suggestedProducts, clientProducts, locale]);

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

  const isLoading = !suggestedProducts && loading;
  if (isLoading) {
    return (
      <section className="w-full bg-[#FFFFFF] py-12 lg:py-16">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
          <p className="text-[#3D1A00] font-['Montserrat']">{dict.common.loading}</p>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className="w-full bg-[#FFFFFF]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="mb-8 flex items-center justify-between gap-4 lg:mb-10">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-[#3D1A00] font-['Montserrat'] lg:text-3xl">
            {title || dict.common.similarProducts}
          </h2>
          <div className="flex items-center gap-2">
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
          className="flex gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product, index) => {
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
