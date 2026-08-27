"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { SITE_PRODUCT_BRAND } from "@/lib/siteBrand";

type Props = {
  className?: string;
  compact?: boolean;
};

/** Мінімалістична плашка «офіційний представник Choice». */
export default function OfficialRepBadge({ className = "", compact = false }: Props) {
  const { dict } = useLocale();

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/25 pl-2.5 pr-3.5 py-1.5 text-white backdrop-blur-md ${
        compact ? "gap-1.5 pl-2 pr-3 py-1" : ""
      } ${className}`}
      title={dict.brand.officialRep}
      role="img"
      aria-label={dict.brand.officialRep}
    >
      <svg
        viewBox="0 0 16 16"
        className={compact ? "h-3 w-3 shrink-0 opacity-90" : "h-3.5 w-3.5 shrink-0 opacity-90"}
        fill="currentColor"
        aria-hidden
      >
        <path d="M8 1.2l1.76 3.56 3.93.57-2.84 2.77.67 3.91L8 10.18l-3.52 1.83.67-3.91L2.31 5.33l3.93-.57L8 1.2z" />
      </svg>
      <span
        className={`font-['Montserrat'] font-medium tracking-[0.04em] ${
          compact ? "text-[10px]" : "text-[11px] sm:text-xs"
        }`}
      >
        <span className="opacity-80">
          {dict.brand.officialRepBadgeEyebrow}
        </span>{" "}
        <span className="font-semibold">
          {dict.brand.officialRepBadgeTitle.replace("{brand}", SITE_PRODUCT_BRAND)}
        </span>
      </span>
    </span>
  );
}
