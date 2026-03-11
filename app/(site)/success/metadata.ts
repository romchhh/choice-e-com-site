import type { Metadata } from "next";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Успішна оплата замовлення | Choice",
  description:
    "Ваше замовлення wellness та eco-продукції CHOICE успішно оформлене. Перевірте деталі замовлення та очікуйте на доставку.",
  openGraph: {
    title: "Успішна оплата замовлення | Choice",
    description:
      "Сторінка підтвердження успішної оплати замовлення wellness та eco-продукції CHOICE з деталями товарів та сумою замовлення.",
    type: "website",
    locale: "uk_UA",
    url: `${baseUrl}/success`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: "CHOICE — успішне замовлення wellness та eco-продукції",
      },
    ],
    siteName: "Choice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Успішна оплата замовлення | Choice",
    description:
      "Дякуємо за замовлення wellness та eco-продукції CHOICE. Перегляньте підсумок замовлення та очікуйте на доставку.",
    images: [`${baseUrl}/images/tg_image_3614117882.png`],
  },
};

