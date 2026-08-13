import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildSeoMetadata } from "@/lib/i18n/seo";

export function buildSuccessLayoutMetadata(locale: Locale): Metadata {
  return buildSeoMetadata({
    locale,
    path: "/success",
    title:
      locale === "ru"
        ? `Успешная оплата заказа | ${SITE_STORE_NAME}`
        : `Успішна оплата замовлення | ${SITE_STORE_NAME}`,
    description:
      locale === "ru"
        ? `Ваш заказ в интернет-магазине ${SITE_STORE_NAME} успешно оформлен.`
        : `Ваше замовлення в інтернет-магазині ${SITE_STORE_NAME} успішно оформлене.`,
    noIndex: true,
  });
}
