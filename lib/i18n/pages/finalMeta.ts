import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildSeoMetadata } from "@/lib/i18n/seo";

export function buildFinalLayoutMetadata(locale: Locale): Metadata {
  return buildSeoMetadata({
    locale,
    path: "/final",
    title:
      locale === "ru"
        ? `Оформление заказа | ${SITE_STORE_NAME}`
        : `Оформлення замовлення | ${SITE_STORE_NAME}`,
    description:
      locale === "ru"
        ? `Страница оформления заказа в ${SITE_STORE_NAME}.`
        : `Сторінка оформлення замовлення у ${SITE_STORE_NAME}.`,
    noIndex: true,
  });
}
