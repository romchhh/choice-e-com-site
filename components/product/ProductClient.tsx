"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { useState, useEffect, useRef } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Alert from "@/components/shared/Alert";
import CartAlert from "@/components/shared/CartAlert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { getDiscountedPrice, getProductPriceDisplay } from "@/lib/pricing";
import {
  GA4_BRAND,
  GA4_CURRENCY,
  GA4_VERTICAL,
  pushGA4EcommerceEvent,
} from "@/lib/ga4Ecommerce";
import OneClickOrderModal from "@/components/product/OneClickOrderModal";
import ProductDeliveryPaymentTab from "@/components/product/ProductDeliveryPaymentTab";
import YouMightLike from "@/components/product/YouMightLike";
import CategoryDescriptionMarkdown from "@/components/shared/CategoryDescriptionMarkdown";

const DEFAULT_SIZE = "—";

type TabId =
  | "description"
  | "action"
  | "usage"
  | "composition"
  | "contraindications"
  | "delivery_payment";

const TAB_IDS: TabId[] = [
  "description",
  "action",
  "usage",
  "composition",
  "contraindications",
  "delivery_payment",
];

interface ProductClientProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock?: number;
    in_stock?: boolean;
    old_price?: number | null;
    discount_percentage?: number | null;
    subtitle?: string | null;
    release_form?: string | null;
    course?: string | null;
    package_weight?: string | null;
    main_info?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_action?: string | null;
    indications_for_use?: string | null;
    benefits?: string | null;
    full_composition?: string | null;
    usage_method?: string | null;
    contraindications?: string | null;
    storage_conditions?: string | null;
    media?: { url: string; type: string }[];
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
    category_name?: string | null;
    subcategory_name?: string | null;
    category_slug?: string | null;
    category_description?: string | null;
    is_hit?: boolean;
    dietitian_approved?: boolean;
    is_promo?: boolean;
    free_delivery_badge?: boolean;
    gift_product?: {
      id: number;
      name: string;
      slug?: string | null;
      price: number;
      old_price?: number | null;
      discount_percentage?: number | null;
      first_media?: { url: string; type: string } | null;
    } | null;
    bought_together_ids?: number[];
    bought_together_products?: {
      id: number;
      name: string;
      slug?: string | null;
      price: number;
      first_media?: { url: string; type: string } | null;
      description?: string | null;
    }[];
  };
}

export default function ProductClient({ product }: ProductClientProps) {
  const { dict } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const { addItem } = useBasket();
  const { setIsBasketOpen } = useAppContext();
  const [showCartAlert, setShowCartAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const isAddingToCartRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleAddToCart = async () => {
    if (isAddingToCartRef.current) return;
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (!addItem) {
      setAlertMessage("Кошик недоступний. Спробуйте оновити сторінку.");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    isAddingToCartRef.current = true;
    setIsAddingToCart(true);
    try {
      const media = product.media || [];
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: DEFAULT_SIZE,
        quantity,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage ?? undefined,
        subtitle: product.main_info || product.short_description || undefined,
        category_name: analyticsCategory,
      });
      setShowCartAlert(true);
      setTimeout(() => setShowCartAlert(false), 5000);
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Недостатньо товару в наявності"
      );
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      isAddingToCartRef.current = false;
      setIsAddingToCart(false);
    }
  };

  const handleBuyInOneClick = () => {
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    if (outOfStock) {
      setAlertMessage("Товар недоступний для замовлення");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    setOneClickOpen(true);
  };

  const media = product.media || [];
  const outOfStock =
    product.in_stock === false ||
    (typeof product.stock === "number" && product.stock <= 0);
  const { displayPrice } = getProductPriceDisplay({
    price: product.price,
    old_price: product.old_price,
    discount_percentage: product.discount_percentage,
  });

  const analyticsCategory = product.subcategory_name ?? product.category_name ?? null;

  const categorySlug = product.category_slug ?? (product.category_name ? encodeURIComponent(product.category_name) : null);
  const categoryUrl = categorySlug ? `/catalog/${categorySlug}` : "/catalog";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  /** Один view_item на item_id; скидається при зміні товару (клієнтська навігація / схожі товари). */
  const lastViewItemIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isMounted) return;
    if (!product?.id) return;
    if (lastViewItemIdRef.current === product.id) return;

    lastViewItemIdRef.current = product.id;
    const unitPrice = getDiscountedPrice(product.price, product.discount_percentage);

    pushGA4EcommerceEvent("view_item", {
      currency: GA4_CURRENCY,
      value: unitPrice,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_brand: GA4_BRAND,
          item_category: analyticsCategory ?? "Каталог",
          price: unitPrice,
          quantity: 1,
          google_business_vertical: GA4_VERTICAL,
        },
      ],
    });
  }, [
    analyticsCategory,
    isMounted,
    product.discount_percentage,
    product.id,
    product.name,
    product.price,
  ]);

  if (!isMounted) return null;

  const attributesLine1 = product.release_form || product.subtitle || null;
  const packageLine = product.package_weight
    ? `${dict.brand.productPackage}: ${product.package_weight}`
    : null;
  const courseLine = product.course
    ? `${dict.brand.productCourse}: ${product.course}`
    : null;
  const purposeText = product.main_info || product.short_description || product.description;

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return product.description ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.description}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Опис відсутній.</p>
        );
      case "action":
        return (product.main_action || product.benefits || product.indications_for_use) ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {[product.main_action, product.benefits, product.indications_for_use].filter(Boolean).join("\n\n")}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "usage":
        return product.usage_method ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.usage_method}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "composition":
        return (product.full_composition || product.fabric_composition) ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.full_composition || product.fabric_composition}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "contraindications":
        return product.contraindications ? (
          <div className="text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base whitespace-pre-line">
            {product.contraindications}
          </div>
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">Інформація відсутня.</p>
        );
      case "delivery_payment":
        return <ProductDeliveryPaymentTab />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full bg-[#FFFFFF] min-h-screen">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
        {/* Breadcrumbs — тільки з md і вище */}
        <nav className="hidden md:block mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/70">
            <li>
              <LocaleLink href="/" className="hover:text-[#3D1A00] transition-colors">
                {dict.nav.home}
              </LocaleLink>
            </li>
            <li aria-hidden className="text-[#3D1A00]/50">|</li>
            <li>
              {product.category_name ? (
                <LocaleLink href={categoryUrl} className="hover:text-[#3D1A00] transition-colors">
                  {product.category_name}
                </LocaleLink>
              ) : (
                <LocaleLink href="/catalog" className="hover:text-[#3D1A00] transition-colors">
                  {dict.product.breadcrumbCatalog}
                </LocaleLink>
              )}
            </li>
            <li aria-hidden className="text-[#3D1A00]/50">|</li>
            <li className="text-[#3D1A00] font-normal">{product.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start mt-6 lg:mt-8">
          {/* Left: Thumbnails + Main image (з можливістю свайпу між фото) */}
          <div className="flex flex-row gap-4 w-full lg:w-[58%] lg:max-w-[58%]">
            {media.length > 1 && (
              <div className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0 order-2 lg:order-1">
                {media.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative aspect-square w-full rounded overflow-hidden border-2 transition-colors ${
                      activeImageIndex === i
                        ? "border-[#3D1A00]"
                        : "border-transparent hover:border-[#3D1A00]/30"
                    }`}
                  >
                    {item.type === "video" ? (
                      <video
                        className="w-full h-full object-cover"
                        src={`/api/images/${item.url}`}
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
            <div
              className="relative order-1 min-h-[420px] flex-1 touch-pan-y overflow-hidden rounded-lg bg-[#fafafa] sm:min-h-[480px] md:min-h-[520px] lg:order-2 lg:min-h-[620px] xl:min-h-[700px]"
              onTouchStart={(e) => {
                if (!media.length || media.length < 2) return;
                touchStartXRef.current = e.touches[0]?.clientX ?? null;
                touchStartYRef.current = e.touches[0]?.clientY ?? null;
              }}
              onTouchEnd={(e) => {
                if (!media.length || media.length < 2) return;
                if (touchStartXRef.current === null) return;
                const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
                const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current ?? 0;
                const startX = touchStartXRef.current;
                const startY = touchStartYRef.current ?? endY;
                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const threshold = 60; // трохи більший поріг для більш «плавного» свайпу
                touchStartXRef.current = null;
                touchStartYRef.current = null;

                // ігноруємо переважно вертикальні жести
                if (Math.abs(deltaX) < Math.abs(deltaY)) return;
                if (Math.abs(deltaX) < threshold) return;

                if (deltaX < 0) {
                  // свайп вліво -> наступне фото
                  setActiveImageIndex((prev) =>
                    prev < media.length - 1 ? prev + 1 : prev
                  );
                } else {
                  // свайп вправо -> попереднє фото
                  setActiveImageIndex((prev) =>
                    prev > 0 ? prev - 1 : prev
                  );
                }
              }}
            >
              {media[activeImageIndex]?.type === "video" ? (
                <video
                  className="absolute inset-0 z-0 h-full w-full object-contain"
                  src={`/api/images/${media[activeImageIndex]?.url}`}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : media[activeImageIndex] ? (
                <Image
                  src={`/api/images/${media[activeImageIndex].url}`}
                  alt={product.name}
                  fill
                  className="z-0 object-contain"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                />
              ) : (
                <div className="relative z-0 flex h-full w-full items-center justify-center text-[#3D1A00]/40 font-['Montserrat']">
                  Немає зображення
                </div>
              )}

              {(product.is_promo === true ||
                product.is_hit === true ||
                product.dietitian_approved === true ||
                product.free_delivery_badge === true) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/45 via-black/15 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-14">
                  <div className="flex flex-wrap gap-2.5">
                    {product.is_promo === true && (
                      <span className="inline-flex w-fit max-w-full shrink-0 items-center rounded-lg border border-[#3D1A00]/12 bg-[#D7D799] px-3 py-2 text-xs font-bold font-['Montserrat'] uppercase tracking-wide text-[#3D1A00] shadow-md shadow-black/20 sm:text-sm">
                        {dict.common.promo}
                      </span>
                    )}
                    {product.is_hit === true && (
                      <span className="inline-flex w-fit max-w-full shrink-0 items-center rounded-lg bg-[#3D1A00] px-3 py-2 text-xs font-bold font-['Montserrat'] uppercase tracking-wide text-white shadow-md shadow-black/30 sm:text-sm">
                        {dict.common.hit}
                      </span>
                    )}
                    {product.dietitian_approved === true && (
                      <span className="inline-flex w-fit max-w-full shrink-0 items-center rounded-lg border-2 border-[#3D1A00]/20 bg-white px-3 py-2 text-left text-[11px] font-bold font-['Montserrat'] leading-snug tracking-tight text-[#3D1A00] shadow-md shadow-black/15 sm:text-sm">
                        {dict.common.dietitian}
                      </span>
                    )}
                    {product.free_delivery_badge === true && (
                      <span className="inline-flex w-fit max-w-full shrink-0 items-center rounded-lg border border-emerald-800/25 bg-emerald-50 px-3 py-2 text-left text-[10px] font-bold font-['Montserrat'] leading-snug tracking-tight text-emerald-900 shadow-md shadow-black/15 sm:text-xs">
                        {dict.brand.freeDelivery}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-4 w-full lg:max-w-[45%] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em]">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#3D1A00] capitalize leading-[1.29] tracking-[-0.02em]" style={{ fontFamily: "Montserrat, sans-serif" }}>
              {product.name}
            </h1>

            <p className="text-sm md:text-base font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/80">
              {outOfStock ? dict.common.outOfStock : dict.common.inStock}
            </p>

            {(attributesLine1 || packageLine || courseLine) && (
              <div className="flex flex-col gap-0.5 text-sm font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-[#3D1A00]/80">
                {attributesLine1 && <span>{attributesLine1}</span>}
                {packageLine && <span>{packageLine}</span>}
                {courseLine && <span>{courseLine}</span>}
              </div>
            )}

            {purposeText && (
              <p className="text-sm md:text-base font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-[#3D1A00]/90">
                {purposeText}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
              <span className="text-2xl md:text-2xl font-['Montserrat'] font-normal leading-[1.59] tracking-[-0.02em] text-[#3D1A00]">
                {displayPrice.toLocaleString("uk-UA")} {dict.common.uah}
              </span>
              <div className="flex items-center border border-[#3D1A00]/20 rounded overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors"
                  aria-label="Зменшити"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v) && v >= 1) setQuantity(v);
                  }}
                  className="w-14 h-10 py-0 px-2 text-center text-[#3D1A00] border-x border-[#3D1A00]/20 bg-transparent font-['Montserrat'] text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
 style={{ textAlign: "center" }}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors"
                  aria-label="Збільшити"
                >
                  +
                </button>
              </div>
            </div>

            {/* Gift promo */}
            {product.gift_product && (
              <div className="rounded-lg border border-[#3D1A00]/15 bg-[#FFF9F0] p-4">
                <p className="text-sm font-['Montserrat'] font-semibold text-[#3D1A00]">
                  {dict.common.giftToProduct}
                </p>
                <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
                  <LocaleLink
                    href={`/product/${(product.gift_product.slug && String(product.gift_product.slug).trim()) ? product.gift_product.slug : product.gift_product.id}`}
                    className="text-sm font-['Montserrat'] text-[#3D1A00] underline hover:opacity-80"
                  >
                    {product.gift_product.name}
                  </LocaleLink>
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-[#3D1A00]/60">
                      {Math.round(product.gift_product.price).toLocaleString("uk-UA")} {dict.common.uah}
                    </span>
                    <span className="text-sm font-bold text-[#3D1A00]">
                      {dict.common.free}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={outOfStock || isAddingToCart ? undefined : handleAddToCart}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 py-3 px-6 text-center border-2 border-[#3D1A00] bg-white text-[#3D1A00] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] uppercase text-sm md:text-base transition-colors hover:bg-[#3D1A00]/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? dict.common.loading : dict.common.addToCart}
              </button>
              <button
                type="button"
                onClick={outOfStock || isAddingToCart ? undefined : handleBuyInOneClick}
                disabled={outOfStock || isAddingToCart}
                className="flex-1 py-3 px-6 text-center bg-[#D7D799] hover:bg-[#c5c58a] text-[#3D1A00] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] uppercase text-sm md:text-base transition-colors border border-[#b8b87a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? dict.common.loading : dict.common.buyOneClick}
              </button>
            </div>

            <CartAlert
              isVisible={showCartAlert}
              onGoToCart={() => {
                setShowCartAlert(false);
                setIsBasketOpen(true);
              }}
            />
            <Alert
              type={alertType}
              message={alertMessage || ""}
              isVisible={!!alertMessage}
              onClose={() => setAlertMessage(null)}
            />

            <OneClickOrderModal
              open={oneClickOpen}
              onClose={() => setOneClickOpen(false)}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                discount_percentage: product.discount_percentage,
                in_stock: product.in_stock,
                stock: product.stock,
              }}
              quantity={quantity}
            />

            {/* Category description (Markdown) */}
            {product.category_description && (
              <div className="border-t border-[#3D1A00]/10 pt-6">
                <p className="text-xs uppercase tracking-wider text-[#3D1A00]/60 font-['Montserrat'] font-semibold">
                  {dict.common.aboutCategory}
                </p>
                <div className="mt-2">
                  <CategoryDescriptionMarkdown content={product.category_description} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Купують разом */}
        {product.bought_together_products && product.bought_together_products.length > 0 && (
          <div className="mt-10">
            <YouMightLike title={dict.common.boughtTogether} suggestedProducts={product.bought_together_products} />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-12 pt-8 border-t border-[#3D1A00]/10">
          <div className="flex flex-wrap gap-6 md:gap-8 border-b border-[#3D1A00]/15 pb-1 mb-6">
            {TAB_IDS.map((tabId) => {
              const tabLabels: Record<TabId, string> = {
                description: dict.product.tabs.description,
                action: dict.product.tabs.action,
                usage: dict.product.tabs.usage,
                composition: dict.product.tabs.composition,
                contraindications: dict.product.tabs.contraindications,
                delivery_payment: dict.product.tabs.delivery,
              };
              return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm uppercase transition-colors ${
                  activeTab === tabId
                    ? "text-[#3D1A00] font-semibold border-b-2 border-[#3D1A00] pb-1 -mb-[3px]"
                    : "text-[#3D1A00]/70 hover:text-[#3D1A00]"
                }`}
              >
                {tabLabels[tabId]}
              </button>
              );
            })}
          </div>
          <div className="min-h-[120px]">{renderTabContent()}</div>
        </div>
      </div>
    </section>
  );
}
