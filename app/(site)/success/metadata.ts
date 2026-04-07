import type { Metadata } from "next";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: `Успішна оплата замовлення | ${SITE_STORE_NAME}`,
  description: `Ваше замовлення в інтернет-магазині ${SITE_STORE_NAME} успішно оформлене. Перевірте деталі та очікуйте на доставку.`,
  openGraph: {
    title: `Успішна оплата замовлення | ${SITE_STORE_NAME}`,
    description: `Підтвердження оплати замовлення в ${SITE_STORE_NAME}.`,
    type: "website",
    locale: "uk_UA",
    url: `${baseUrl}/success`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_STORE_NAME} — успішне замовлення`,
      },
    ],
    siteName: SITE_STORE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Успішна оплата замовлення | ${SITE_STORE_NAME}`,
    description: `Дякуємо за замовлення в ${SITE_STORE_NAME}.`,
    images: [`${baseUrl}/images/tg_image_3614117882.png`],
  },
};

