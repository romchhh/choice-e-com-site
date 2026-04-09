import type { Metadata } from "next";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Про бренд ForBody, wellness-філософію, партнерство та доставку | ForBody",
  description:
    "Дізнайтеся більше про бренд ForBody, нашу wellness-філософію, партнерську програму, умови доставки та оплати eco і wellness-продукції по всій Україні.",
  openGraph: {
    title: "Про бренд ForBody та wellness-підхід | ForBody",
    description:
      "Хто такі ForBody, як ми підходимо до wellness, з чого складається партнерська програма та як працює доставка eco й wellness-продукції по Україні.",
    type: "website",
    locale: "uk_UA",
    url: `${baseUrl}/info`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: "ForBody — wellness та eco-продукція",
      },
    ],
    siteName: "ForBody",
  },
  twitter: {
    card: "summary_large_image",
    title: "Про бренд ForBody та wellness-підхід | ForBody",
    description:
      "Детальна інформація про бренд ForBody, wellness-філософію, партнерство та умови доставки natural та eco-продукції.",
    images: [`${baseUrl}/images/tg_image_3614117882.png`],
  },
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
