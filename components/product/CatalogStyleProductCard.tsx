"use client";

import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import ProductCardBadges from "@/components/product/ProductCardBadges";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { getProductPriceDisplay } from "@/lib/pricing";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

export type CatalogStyleProduct = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  in_stock?: boolean;
  stock?: number;
  is_hit?: boolean;
  is_promo?: boolean;
  dietitian_approved?: boolean;
  free_delivery_badge?: boolean;
  package_weight?: string | null;
  course?: string | null;
  gift_product_id?: number | null;
  gift_product?: {
    id: number;
    name: string;
    name_ru?: string | null;
    slug?: string | null;
    price?: number;
  } | null;
};

type Labels = {
  addToCart: string;
  buyOneClick: string;
  outOfStock: string;
  loading: string;
  uah: string;
  productPackage: string;
  productCourse: string;
  gift: string;
  promo: string;
  hit: string;
  giftToProduct: string;
  free: string;
  dietitian: string;
};

type Props = {
  product: CatalogStyleProduct;
  labels: Labels;
  numberLocale: string;
  index?: number;
  adding?: boolean;
  onAddToCart: (e: MouseEvent, product: CatalogStyleProduct) => void;
  onOneClick: (e: MouseEvent, product: CatalogStyleProduct) => void;
  className?: string;
  footerExtra?: ReactNode;
};

export default function CatalogStyleProductCard({
  product,
  labels,
  numberLocale,
  index = 0,
  adding = false,
  onAddToCart,
  onOneClick,
  className = "",
  footerExtra,
}: Props) {
  const outOfStock =
    product.in_stock === false ||
    (typeof product.stock === "number" && product.stock <= 0);
  const { displayPrice, strikePrice, discountBadgePct } =
    getProductPriceDisplay(product);
  const href = `/product/${
    product.slug && String(product.slug).trim() ? product.slug : product.id
  }`;
  const rawDesc = product.description
    ? product.description.replace(/<[^>]*>/g, "").trim()
    : "";
  const shortDesc =
    rawDesc.length > 60 ? rawDesc.slice(0, 60).trim() + "…" : rawDesc || null;
  const hasGift =
    (product.gift_product_id != null && product.gift_product_id > 0) ||
    !!product.gift_product;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <LocaleLink
        href={href}
        scroll={false}
        onClick={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }
        }}
        className="flex min-h-0 flex-1 flex-col"
        aria-label={product.name}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
          {product.first_media?.type === "video" ? (
            <video
              src={`/api/images/${product.first_media.url}`}
              className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loop
              muted
              playsInline
              autoPlay
              preload="none"
            />
          ) : product.first_media?.url ? (
            <Image
              src={getProductImageSrc(product.first_media)}
              alt={`${product.name} — ${SITE_STORE_NAME}`}
              className="z-0 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
              loading={index < 9 ? "eager" : "lazy"}
              priority={index < 3}
              quality={index < 9 ? 85 : 75}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200" aria-hidden />
          )}

          <ProductCardBadges
            isPromo={product.is_promo === true}
            isHit={product.is_hit === true}
            hasGift={hasGift}
            giftProduct={product.gift_product ?? null}
            discountPct={discountBadgePct}
            giftLabel={labels.gift}
            promoLabel={labels.promo}
            hitLabel={labels.hit}
            giftToLabel={labels.giftToProduct}
            freeLabel={labels.free}
          />

          {!product.gift_product && product.dietitian_approved === true && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/45 via-black/15 to-transparent px-1.5 pb-1.5 pt-8 sm:px-2 sm:pb-2 sm:pt-10">
              <span className="inline-flex max-w-full items-center rounded-md border border-[#3D1A00]/15 bg-white/95 px-1.5 py-1 font-['Montserrat'] text-[8px] font-bold leading-snug tracking-tight text-[#3D1A00] shadow-sm sm:px-2 sm:text-[10px]">
                <span className="line-clamp-2">{labels.dietitian}</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
          <h3 className="line-clamp-2 break-words font-['Montserrat'] text-base font-light leading-tight tracking-[-0.02em] text-[#3D1A00] sm:text-lg md:text-xl lg:text-2xl">
            {product.name}
          </h3>
          {shortDesc && (
            <p className="line-clamp-2 align-middle font-['Montserrat'] text-[11px] font-light leading-[194%] tracking-[-0.02em] text-[#3D1A00]">
              {shortDesc}
            </p>
          )}
          {(product.package_weight || product.course) && (
            <div className="space-y-0.5 font-['Montserrat'] text-[10px] leading-snug text-[#3D1A00]/75 sm:text-[11px]">
              {product.package_weight ? (
                <p>
                  <span className="font-semibold text-[#3D1A00]/90">
                    {labels.productPackage}:
                  </span>{" "}
                  {product.package_weight}
                </p>
              ) : null}
              {product.course ? (
                <p>
                  <span className="font-semibold text-[#3D1A00]/90">
                    {labels.productCourse}:
                  </span>{" "}
                  {product.course}
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-auto flex flex-col gap-0.5 pt-3">
            {strikePrice != null && (
              <span className="font-['Montserrat'] text-sm font-normal leading-none tracking-[-0.02em] text-[#3D1A00]/70 line-through sm:text-base lg:text-xl">
                {strikePrice.toLocaleString(numberLocale)} {labels.uah}
              </span>
            )}
            <span className="align-middle font-['Montserrat'] text-lg font-normal leading-none tracking-[-0.02em] text-[#3D1A00] sm:text-xl lg:text-3xl">
              {displayPrice.toLocaleString(numberLocale)} {labels.uah}
            </span>
          </div>
        </div>
      </LocaleLink>

      <div className="flex flex-col gap-1.5 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4">
        <div className="flex flex-col gap-1.5 lg:flex-row lg:gap-2">
          <button
            type="button"
            disabled={outOfStock || adding}
            onClick={(e) => onAddToCart(e, product)}
            className={`min-h-10 w-full rounded-full px-2.5 py-2 font-['Montserrat'] text-[11px] font-semibold leading-tight transition-colors sm:text-xs lg:min-h-[40px] lg:flex-1 lg:px-3 lg:text-sm ${
              outOfStock
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-[#8B9A47] text-white hover:bg-[#7a8940]"
            }`}
          >
            {adding
              ? labels.loading
              : outOfStock
                ? labels.outOfStock
                : labels.addToCart}
          </button>
          <button
            type="button"
            disabled={outOfStock}
            onClick={(e) => onOneClick(e, product)}
            className="min-h-10 w-full rounded-full bg-[#D7D799] px-2.5 py-2 font-['Montserrat'] text-[11px] font-semibold leading-tight text-[#3D1A00] transition-colors hover:bg-[#c5c58a] disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs lg:min-h-[40px] lg:flex-1 lg:px-3 lg:text-sm"
          >
            {labels.buyOneClick}
          </button>
        </div>
        {footerExtra}
      </div>
    </div>
  );
}
