import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/getLocale";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildSeoMetadata } from "@/lib/i18n/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
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

export default function SuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
