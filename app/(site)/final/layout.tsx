import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/getLocale";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildSeoMetadata } from "@/lib/i18n/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
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

export default function FinalLayout({ children }: { children: ReactNode }) {
  return children;
}
