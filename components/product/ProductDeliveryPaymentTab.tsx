"use client";

import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getProductDeliveryCopy } from "@/lib/i18n/content/productDelivery";

export default function ProductDeliveryPaymentTab() {
  const { locale } = useLocale();
  const t = getProductDeliveryCopy(locale);

  return (
    <div className="space-y-8 text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base">
      <div>
        <h3 className="text-[#3D1A00] font-semibold uppercase text-xs md:text-sm tracking-wide mb-3">
          {t.paymentTitle}
        </h3>
        <p className="text-[#3D1A00]/85 mb-3">{t.paymentIntro}</p>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50 text-[#3D1A00]/90">
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.cardStrong}</strong>
            {t.cardRest}
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.payServicesStrong}</strong>
            {t.payServicesRest}
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.fopStrong}</strong>
            {t.fopRest}
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.codStrong}</strong>
            {t.codRest}
            <span className="whitespace-nowrap">{t.codFee}</span>
            {t.codDetails}
            <a
              href="https://novaposhta.ua/shipping-cost"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D1A00] underline underline-offset-2 hover:opacity-80"
            >
              novaposhta.ua
            </a>
            ).
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-[#3D1A00] font-semibold uppercase text-xs md:text-sm tracking-wide mb-3">
          {t.deliveryTitle}
        </h3>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50 mb-4">
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.from80Strong}</strong>
            {t.from80Rest}
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.freeStrong}</strong>
            {t.freeRest}
            <strong>{t.freeAmount}</strong>
            {t.freeRest2}
          </li>
        </ul>
        <p className="text-[#3D1A00]/85 font-medium mb-2">{t.methodsLabel}</p>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50">
          <li>
            {t.branchBefore}
            <strong className="font-semibold text-[#3D1A00]">{t.branchStrong}</strong>
            {t.branchAfter}
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">{t.courierStrong}</strong>
            {t.courierRest}
          </li>
          <li>
            {t.upBefore}
            <strong className="font-semibold text-[#3D1A00]">{t.upStrong}</strong>
            {t.upAfter}
          </li>
        </ul>
        <p className="text-[#3D1A00]/75 text-sm mt-4 leading-relaxed">{t.timing}</p>
      </div>

      <p className="text-sm text-[#3D1A00]/70 pt-2 border-t border-[#3D1A00]/10">
        <LocaleLink
          href="/delivery-and-payment"
          className="text-[#3D1A00] font-medium underline underline-offset-2 hover:opacity-80"
        >
          {t.fullTerms}
        </LocaleLink>
      </p>
    </div>
  );
}
