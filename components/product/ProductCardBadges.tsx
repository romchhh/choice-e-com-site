"use client";

import LocaleLink from "@/components/i18n/LocaleLink";

type GiftProduct = {
  id: number;
  name: string;
  slug?: string | null;
  price?: number;
};

type Props = {
  isPromo?: boolean;
  isHit?: boolean;
  hasGift?: boolean;
  giftProduct?: GiftProduct | null;
  discountPct?: number | null;
  giftLabel: string;
  promoLabel: string;
  hitLabel: string;
  giftToLabel: string;
  freeLabel: string;
  /** Compact overlays for catalog/home cards */
  compact?: boolean;
};

function GiftIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

const chipBase =
  "inline-flex h-6 max-w-full items-center rounded-md px-1.5 font-['Montserrat'] text-[9px] font-bold uppercase leading-none tracking-wide shadow-sm sm:h-7 sm:px-2 sm:text-[10px]";

/**
 * Promo/gift badges for product media on catalog and home cards.
 */
export default function ProductCardBadges({
  isPromo,
  isHit,
  hasGift,
  giftProduct,
  discountPct,
  giftLabel,
  promoLabel,
  hitLabel,
  giftToLabel,
  freeLabel,
  compact = true,
}: Props) {
  const giftHref = giftProduct
    ? `/product/${
        giftProduct.slug && String(giftProduct.slug).trim()
          ? giftProduct.slug
          : giftProduct.id
      }`
    : null;

  const showTopRow =
    isPromo === true ||
    isHit === true ||
    hasGift === true ||
    (discountPct != null && discountPct > 0);

  const giftCardInner = (
    <div className="flex items-start gap-1.5 rounded-lg border border-[#E8C547]/45 bg-[#FFF8E7]/97 px-2 py-1.5 shadow-sm backdrop-blur-[1px] sm:items-center sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2">
      <GiftIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A000] sm:mt-0 sm:h-4 sm:w-4" />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <p className="font-['Montserrat'] text-[8px] font-semibold uppercase tracking-[0.05em] text-[#8A6B00] sm:text-[9px]">
            {giftToLabel}
          </p>
          <span className="inline-flex shrink-0 rounded-full bg-[#E8B923]/25 px-1.5 py-px font-['Montserrat'] text-[8px] font-bold uppercase tracking-wide text-[#6B5200] sm:text-[9px]">
            {freeLabel}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 font-['Montserrat'] text-[10px] font-semibold leading-snug text-[#3D1A00] sm:line-clamp-1 sm:text-[11px]">
          {giftProduct?.name}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {showTopRow && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-1.5 sm:p-2">
          <div className="flex flex-wrap content-start items-center gap-1 sm:gap-1.5">
            {isPromo === true && (
              <span className={`${chipBase} bg-[#C45C26] text-white`}>
                {promoLabel}
              </span>
            )}
            {isHit === true && (
              <span className={`${chipBase} bg-[#3D1A00] text-white`}>
                {hitLabel}
              </span>
            )}
            {discountPct != null && discountPct > 0 && (
              <span className={`${chipBase} bg-amber-200 text-amber-950`}>
                −{discountPct}%
              </span>
            )}
            {hasGift && (
              <span
                className={`${chipBase} gap-0.5 border border-[#E8C547]/55 bg-[#FFF8E7]/95 text-[#6B5200]`}
              >
                <GiftIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="truncate">{giftLabel}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {hasGift && giftProduct?.name && (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent ${
            compact ? "p-1.5 pt-6 sm:p-2 sm:pt-7" : "p-2.5 pt-7"
          }`}
        >
          {giftHref ? (
            <LocaleLink
              href={giftHref}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto block transition-opacity hover:opacity-95"
            >
              {giftCardInner}
            </LocaleLink>
          ) : (
            <div className="w-full">{giftCardInner}</div>
          )}
        </div>
      )}
    </>
  );
}
