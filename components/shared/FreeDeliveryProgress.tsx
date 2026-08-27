"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  FREE_DELIVERY_THRESHOLD_UAH,
  getFreeDeliveryProgress,
  getFreeDeliveryRemaining,
  hasUnlockedFreeDelivery,
} from "@/lib/freeDelivery";

type Props = {
  /** Фактична сума кошика */
  cartTotal: number;
  /** Сума з урахуванням товару на сторінці (лише для PDP) */
  previewTotal?: number;
  compact?: boolean;
};

export default function FreeDeliveryProgress({
  cartTotal,
  previewTotal,
  compact = false,
}: Props) {
  const { dict } = useLocale();
  const cartUnlocked = hasUnlockedFreeDelivery(cartTotal);
  const progressTotal =
    previewTotal != null && !cartUnlocked ? previewTotal : cartTotal;
  const progressUnlocked = hasUnlockedFreeDelivery(progressTotal);
  const remaining = getFreeDeliveryRemaining(progressTotal);
  const progress = getFreeDeliveryProgress(progressTotal);

  const message = cartUnlocked
    ? dict.basket.freeDeliveryUnlocked
    : previewTotal != null && progressUnlocked
      ? dict.basket.freeDeliveryUnlockedWithItem
      : dict.basket.freeDeliveryRemaining.replace(
          "{amount}",
          remaining.toLocaleString("uk-UA")
        );

  return (
    <div
      className={`rounded-xl border border-[#D7D799]/80 bg-[#F4F6EC] ${
        compact ? "px-3 py-2.5" : "px-3.5 py-3"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex shrink-0 items-center justify-center text-[#4A5530] ${
            compact ? "h-5 w-5" : "h-6 w-6"
          }`}
          aria-hidden
        >
          <svg
            width={compact ? 16 : 18}
            height={compact ? 16 : 18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={`font-['Montserrat'] font-semibold leading-snug text-[#4A5530] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {message}
          </p>

          <div
            className={`mt-2 w-full overflow-hidden rounded-full bg-white/90 ${
              compact ? "h-1.5" : "h-2"
            }`}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={dict.basket.freeDeliveryProgressAria}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressUnlocked ? "bg-[#8B9A47]" : "bg-[#C5CB7A]"
              }`}
              style={{
                width: `${Math.max(progress, progressUnlocked ? 100 : 4)}%`,
              }}
            />
          </div>

          {!progressUnlocked && (
            <p
              className={`mt-1.5 font-['Montserrat'] text-[#6B7550] ${
                compact ? "text-[10px]" : "text-xs"
              }`}
            >
              {dict.basket.freeDeliveryHint.replace(
                "{threshold}",
                FREE_DELIVERY_THRESHOLD_UAH.toLocaleString("uk-UA")
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
