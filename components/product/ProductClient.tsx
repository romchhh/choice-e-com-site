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
import { getDiscountedPrice, getItemSubtotal, getProductPriceDisplay } from "@/lib/pricing";
import {
  GA4_BRAND,
  GA4_CURRENCY,
  GA4_VERTICAL,
  pushGA4EcommerceEvent,
} from "@/lib/ga4Ecommerce";
import OneClickOrderModal from "@/components/product/OneClickOrderModal";
import ProductDeliveryPaymentTab from "@/components/product/ProductDeliveryPaymentTab";
import {
  ProductCompositionContent,
  ProductTextTabContent,
} from "@/components/product/ProductDetailsAccordion";
import YouMightLike from "@/components/product/YouMightLike";
import CategoryDescriptionMarkdown from "@/components/shared/CategoryDescriptionMarkdown";
import ProductCourseCalculator from "@/components/product/ProductCourseCalculator";
import FreeDeliveryProgress from "@/components/shared/FreeDeliveryProgress";
import ExpandableProductName from "@/components/shared/ExpandableProductName";
import ImageLightbox from "@/components/shared/ImageLightbox";
import StarRating from "@/components/shared/StarRating";
import { normalizeCompositionItems } from "@/lib/productComposition";
import { siteContact } from "@/lib/siteContact";

const DEFAULT_SIZE = "—";

type TabId =
  | "description"
  | "composition"
  | "usage"
  | "effect"
  | "contraindications"
  | "delivery_payment";

const ALL_TAB_IDS: TabId[] = [
  "description",
  "composition",
  "usage",
  "effect",
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
    course_days?: number | null;
    package_weight?: string | null;
    main_info?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_action?: string | null;
    indications_for_use?: string | null;
    benefits?: string | null;
    full_composition?: string | null;
    composition_items?: { name: string; description: string }[] | null;
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
    doctor_choice_badge?: boolean;
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<{
    average: number;
    count: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const { addItem, items } = useBasket();
  const { isBasketOpen, setIsBasketOpen } = useAppContext();
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

  const handleAddToCart = async (qtyOverride?: number) => {
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
    const qty =
      typeof qtyOverride === "number" && qtyOverride > 0
        ? qtyOverride
        : quantity;
    isAddingToCartRef.current = true;
    setIsAddingToCart(true);
    try {
      const media = product.media || [];
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: DEFAULT_SIZE,
        quantity: qty,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage ?? undefined,
        subtitle: product.main_info || product.short_description || undefined,
        category_name: analyticsCategory,
      });
      if (typeof qtyOverride === "number" && qtyOverride > 0) {
        setQuantity(qtyOverride);
      }
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
  const photoUrls = media
    .filter((item) => item.type !== "video" && item.url)
    .map((item) => `/api/images/${item.url}`);
  const lightboxStartIndex = (() => {
    const current = media[activeImageIndex];
    if (!current || current.type === "video" || !current.url) return 0;
    const idx = photoUrls.indexOf(`/api/images/${current.url}`);
    return idx >= 0 ? idx : 0;
  })();
  const outOfStock =
    product.in_stock === false ||
    (typeof product.stock === "number" && product.stock <= 0);
  const { displayPrice } = getProductPriceDisplay({
    price: product.price,
    old_price: product.old_price,
    discount_percentage: product.discount_percentage,
  });

  const basketTotal = items.reduce(
    (sum, item) =>
      sum + getItemSubtotal(item.price, item.quantity, item.discount_percentage),
    0
  );
  const existingBasketItem = items.find(
    (item) => item.id === product.id && item.size === DEFAULT_SIZE
  );
  const existingBasketSubtotal = existingBasketItem
    ? getItemSubtotal(
        existingBasketItem.price,
        existingBasketItem.quantity,
        existingBasketItem.discount_percentage
      )
    : 0;
  const previewSubtotal = getItemSubtotal(
    product.price,
    quantity,
    product.discount_percentage
  );
  const deliveryPreviewTotal =
    basketTotal - existingBasketSubtotal + previewSubtotal;

  const analyticsCategory = product.subcategory_name ?? product.category_name ?? null;

  const categorySlug = product.category_slug ?? (product.category_name ? encodeURIComponent(product.category_name) : null);
  const categoryUrl = categorySlug ? `/catalog/${categorySlug}` : "/catalog";

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (cancelled) return;
        const average = Number(data?.summary?.average) || 0;
        const count = Number(data?.summary?.count) || 0;
        setRatingSummary(count > 0 ? { average, count } : null);
      } catch {
        if (!cancelled) setRatingSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product.id]);

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
  const compositionItems = normalizeCompositionItems(product.composition_items);
  const compositionText = product.full_composition || product.fabric_composition;
  const effectText = [product.main_action, product.benefits, product.indications_for_use]
    .filter(Boolean)
    .join("\n\n");

  const hasComposition =
    compositionItems.length > 0 || Boolean(compositionText?.trim());
  const hasUsage = Boolean(product.usage_method?.trim());
  const hasEffect = Boolean(effectText.trim());

  const visibleTabs = ALL_TAB_IDS.filter((tabId) => {
    switch (tabId) {
      case "composition":
        return hasComposition;
      case "usage":
        return hasUsage;
      case "effect":
        return hasEffect;
      default:
        return true;
    }
  });

  const tabLabels: Record<TabId, string> = {
    description: dict.product.tabs.description,
    composition: dict.product.details.composition,
    usage: dict.product.details.usage,
    effect: dict.product.details.effect,
    contraindications: dict.product.tabs.contraindications,
    delivery_payment: dict.product.tabs.delivery,
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return product.description ? (
          <ProductTextTabContent text={product.description} />
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">
            {dict.product.details.empty}
          </p>
        );
      case "composition":
        return (
          <ProductCompositionContent
            compositionItems={compositionItems}
            compositionText={compositionText}
            emptyLabel={dict.product.details.empty}
          />
        );
      case "usage":
        return product.usage_method ? (
          <ProductTextTabContent text={product.usage_method} />
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">
            {dict.product.details.empty}
          </p>
        );
      case "effect":
        return effectText ? (
          <ProductTextTabContent text={effectText} />
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">
            {dict.product.details.empty}
          </p>
        );
      case "contraindications":
        return product.contraindications ? (
          <ProductTextTabContent text={product.contraindications} />
        ) : (
          <p className="text-[#3D1A00]/70 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm">
            {dict.product.details.empty}
          </p>
        );
      case "delivery_payment":
        return <ProductDeliveryPaymentTab />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full bg-[#FFFFFF] min-h-screen pb-36 lg:pb-0">
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
              role={
                media[activeImageIndex]?.type !== "video" &&
                media[activeImageIndex]?.url
                  ? "button"
                  : undefined
              }
              tabIndex={
                media[activeImageIndex]?.type !== "video" &&
                media[activeImageIndex]?.url
                  ? 0
                  : undefined
              }
              onClick={() => {
                if (
                  media[activeImageIndex]?.type !== "video" &&
                  media[activeImageIndex]?.url &&
                  photoUrls.length > 0
                ) {
                  setLightboxOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                if (
                  media[activeImageIndex]?.type !== "video" &&
                  media[activeImageIndex]?.url &&
                  photoUrls.length > 0
                ) {
                  e.preventDefault();
                  setLightboxOpen(true);
                }
              }}
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
                  className="z-0 cursor-zoom-in object-contain"
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
                product.free_delivery_badge === true ||
                product.doctor_choice_badge === true ||
                !!product.gift_product) && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap gap-2 p-3 sm:p-4">
                  {product.is_promo === true && (
                    <span className="inline-flex items-center bg-[#C45C26] px-3 py-2 text-xs font-extrabold font-['Montserrat'] uppercase tracking-wide text-white shadow-md shadow-black/25 sm:text-sm">
                      {dict.common.promo}
                    </span>
                  )}
                  {product.is_hit === true && (
                    <span className="inline-flex items-center bg-[#3D1A00] px-3 py-2 text-xs font-extrabold font-['Montserrat'] uppercase tracking-wide text-white shadow-md shadow-black/30 sm:text-sm">
                      {dict.common.hit}
                    </span>
                  )}
                  {product.doctor_choice_badge === true && (
                    <span className="inline-flex max-w-[min(100%,14rem)] items-center bg-[#1B4D3E] px-3 py-2 text-left text-[10px] font-extrabold font-['Montserrat'] uppercase leading-snug tracking-wide text-white shadow-md shadow-black/25 sm:max-w-none sm:text-xs">
                      {dict.common.doctorChoice}
                    </span>
                  )}
                  {product.gift_product && (
                    <span className="inline-flex items-center bg-[#E8B923] px-3 py-2 text-xs font-extrabold font-['Montserrat'] uppercase tracking-wide text-[#3D1A00] shadow-md shadow-black/25 sm:text-sm">
                      {dict.common.gift}
                    </span>
                  )}
                </div>
              )}
              {(product.dietitian_approved === true ||
                product.free_delivery_badge === true) && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/45 via-black/15 to-transparent px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-14">
                  <div className="flex flex-wrap gap-2.5">
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
          <div className="flex flex-col gap-6 w-full lg:max-w-[45%] font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <ExpandableProductName
                  as="h1"
                  name={product.name}
                  variant="page"
                  className="min-w-0 flex-1"
                />
                {ratingSummary ? (
                  <a
                    href="#product-reviews-heading"
                    className="inline-flex items-center gap-2 no-underline"
                    aria-label={`${ratingSummary.average} з 5, ${ratingSummary.count} відгуків`}
                  >
                    <StarRating rating={ratingSummary.average} size="md" />
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]/70">
                      {ratingSummary.average.toFixed(1)}
                      <span className="text-[#3D1A00]/45">
                        {" "}
                        ({ratingSummary.count})
                      </span>
                    </span>
                  </a>
                ) : null}
              </div>

              <p className="text-sm text-[#3D1A00]/80 md:text-base">
                {outOfStock ? dict.common.outOfStock : dict.common.inStock}
              </p>

              {(attributesLine1 || packageLine || courseLine) && (
                <div className="flex flex-col gap-0.5 text-sm text-[#3D1A00]/80">
                  {attributesLine1 && <span>{attributesLine1}</span>}
                  {packageLine && <span>{packageLine}</span>}
                  {courseLine && <span>{courseLine}</span>}
                </div>
              )}

              {purposeText && (
                <p className="text-sm leading-relaxed text-[#3D1A00]/90 md:text-base">
                  {purposeText}
                </p>
              )}
            </div>

            {/* Замовлення */}
            <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3D1A00]/55">
                {dict.product.purchaseBlock}
              </h2>

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-2xl font-normal leading-none text-[#3D1A00] md:text-3xl">
                    {displayPrice.toLocaleString("uk-UA")} {dict.common.uah}
                  </span>
                  <p className="mt-2 inline-flex w-fit items-center rounded-full bg-[#F4F6EC] px-2.5 py-1 text-xs font-medium text-[#5F6B2E] md:text-sm">
                    {dict.common.freeDeliveryNearPrice}
                  </p>
                </div>
                <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-[#3D1A00]/20">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-[#3D1A00] transition-colors hover:bg-[#3D1A00]/5"
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
                    className="h-10 w-14 border-x border-[#3D1A00]/20 bg-transparent px-2 text-center text-sm text-[#3D1A00] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ textAlign: "center" }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-[#3D1A00] transition-colors hover:bg-[#3D1A00]/5"
                    aria-label="Збільшити"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="hidden flex-col gap-4 border-t border-neutral-100 pt-4 lg:flex">
                <div className="flex flex-row gap-3">
                  <button
                    type="button"
                    onClick={
                      outOfStock || isAddingToCart
                        ? undefined
                        : () => {
                            void handleAddToCart();
                          }
                    }
                    disabled={outOfStock || isAddingToCart}
                    className="flex-1 rounded-full bg-[#8B9A47] py-3.5 px-6 text-center text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#7a8940] disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
                  >
                    {isAddingToCart ? dict.common.loading : dict.common.addToCart}
                  </button>
                  <button
                    type="button"
                    onClick={
                      outOfStock || isAddingToCart ? undefined : handleBuyInOneClick
                    }
                    disabled={outOfStock || isAddingToCart}
                    className="flex-1 rounded-full border-2 border-[#3D1A00] bg-white py-3.5 px-6 text-center text-sm font-semibold uppercase tracking-wide text-[#3D1A00] transition-colors hover:bg-[#3D1A00]/5 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
                  >
                    {isAddingToCart ? dict.common.loading : dict.common.buyOneClick}
                  </button>
                </div>
                <FreeDeliveryProgress
                  cartTotal={basketTotal}
                  previewTotal={deliveryPreviewTotal}
                  compact
                />
              </div>
            </section>

            {/* Курс і подарунок */}
            {(product.course_days || product.gift_product) && (
              <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3D1A00]/55">
                  {dict.product.courseAndGift}
                </h2>

                <ProductCourseCalculator
                  embedded
                  courseText={product.course}
                  courseDays={product.course_days}
                  unitPrice={displayPrice}
                  labels={{
                    title: dict.product.courseCalc.title,
                    months: dict.product.courseCalc.months,
                    packOne: dict.product.courseCalc.packOne,
                    packFew: dict.product.courseCalc.packFew,
                    packMany: dict.product.courseCalc.packMany,
                    addCourse: dict.product.courseCalc.addCourse,
                    daysPerPack: dict.product.courseCalc.daysPerPack,
                    uah: dict.common.uah,
                  }}
                  disabled={outOfStock || isAddingToCart}
                  onAddCourse={(packs) => {
                    void handleAddToCart(packs);
                  }}
                />

                {product.gift_product && (
                  <div
                    className={`flex items-start gap-3 rounded-xl border border-[#E8C547]/40 bg-[#FFFBF5] px-4 py-3.5${
                      product.course_days
                        ? " mt-4 border-t border-neutral-100 pt-4"
                        : ""
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-[#8A6B00]" aria-hidden>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1 text-sm leading-relaxed text-[#3D1A00]/80">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A6B00]">
                        {dict.common.gift}
                      </p>
                      <p className="mt-1">
                        <LocaleLink
                          href={`/product/${
                            product.gift_product.slug &&
                            String(product.gift_product.slug).trim()
                              ? product.gift_product.slug
                              : product.gift_product.id
                          }`}
                          className="font-medium text-[#3D1A00] underline decoration-[#E8B923]/60 underline-offset-2 transition-colors hover:text-[#3D1A00]/80"
                        >
                          {product.gift_product.name}
                        </LocaleLink>
                        <span className="ml-2 inline-flex items-center rounded-full bg-[#E8B923]/20 px-2 py-0.5 text-xs font-semibold text-[#6B5200]">
                          {dict.common.free}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

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

        {/* Консультація — завжди на одному місці, на всю ширину */}
        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <span className="mt-0.5 shrink-0 text-[#3D1A00]" aria-hidden>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-['Montserrat'] text-base font-semibold leading-snug text-[#3D1A00] sm:text-lg">
                {dict.product.consult.title}
              </p>
              <p className="mt-2 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/65 sm:text-[15px]">
                {dict.product.consult.body}
              </p>
              <a
                href={siteContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3D1A00] px-5 py-2.5 font-['Montserrat'] text-sm font-semibold text-[#FFF9F0] transition-colors hover:bg-[#3D1A00]/88"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
                </svg>
                {dict.product.consult.cta}
              </a>
            </div>
          </div>
        </section>

        {/* Product details tabs */}
        <div className="mt-12 border-t border-[#3D1A00]/10 pt-8">
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-[#3D1A00]/15 pb-1 md:gap-8">
            {visibleTabs.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`font-['Montserrat'] text-xs font-normal uppercase leading-[1.86] tracking-[-0.02em] transition-colors sm:text-sm ${
                  activeTab === tabId
                    ? "-mb-[3px] border-b-2 border-[#3D1A00] pb-1 font-semibold text-[#3D1A00]"
                    : "text-[#3D1A00]/70 hover:text-[#3D1A00]"
                }`}
              >
                {tabLabels[tabId]}
              </button>
            ))}
          </div>
          <div className="min-h-[120px]">{renderTabContent()}</div>
        </div>

        {/* Купують разом — після опису / складу */}
        {product.bought_together_products && product.bought_together_products.length > 0 && (
          <div className="mt-12">
            <YouMightLike title={dict.common.boughtTogether} suggestedProducts={product.bought_together_products} />
          </div>
        )}
      </div>

      {/* Mobile sticky CTA — ховаємо, коли відкритий кошик (щоб не дублювати прогрес доставки) */}
      {!isBasketOpen && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  outOfStock || isAddingToCart
                    ? undefined
                    : () => {
                        void handleAddToCart();
                      }
                }
                disabled={outOfStock || isAddingToCart}
                className="flex-1 rounded-full border border-neutral-300 bg-white py-3 text-center font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-neutral-900 disabled:opacity-50"
              >
                {isAddingToCart ? dict.common.loading : dict.common.addToCart}
              </button>
              <button
                type="button"
                onClick={
                  outOfStock || isAddingToCart ? undefined : handleBuyInOneClick
                }
                disabled={outOfStock || isAddingToCart}
                className="flex-1 rounded-full bg-[#D7D799] py-3 text-center font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-neutral-900 disabled:opacity-50"
              >
                {isAddingToCart ? dict.common.loading : dict.common.buyOneClick}
              </button>
            </div>
            <FreeDeliveryProgress
              cartTotal={basketTotal}
              previewTotal={deliveryPreviewTotal}
              compact
            />
          </div>
        </div>
      )}
      <ImageLightbox
        images={lightboxOpen ? photoUrls : null}
        startIndex={lightboxStartIndex}
        alt={product.name}
        onClose={() => setLightboxOpen(false)}
      />
    </section>
  );
}
