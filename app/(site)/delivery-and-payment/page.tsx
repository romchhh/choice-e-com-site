import type { Metadata } from "next";
import Link from "next/link";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: `Доставка та оплата | ${SITE_STORE_NAME}`,
  description:
    "Доставка Новою Поштою та Укрпоштою по Україні, самовивіз за домовленістю, накладений платіж, безкоштовна доставка від 2000 грн.",
  openGraph: {
    title: "Доставка та оплата | Choice",
    description:
      "Умови доставки Новою Поштою та Укрпоштою, оплата при отриманні та правила безкоштовної доставки.",
    type: "article",
    locale: "uk_UA",
    url: `${baseUrl}/delivery-and-payment`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_STORE_NAME} — доставка та оплата`,
      },
    ],
    siteName: SITE_STORE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `Доставка та оплата | ${SITE_STORE_NAME}`,
    description: `Умови доставки та оплати для замовлень в інтернет-магазині ${SITE_STORE_NAME}.`,
    images: [`${baseUrl}/images/tg_image_3614117882.png`],
  },
};

export default function DeliveryAndPaymentPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <Link
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            ← На головну
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Доставка та оплата
          </h1>
          <div className="w-20 h-1 bg-black mt-6" />
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Доставка</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Нова Пошта (відділення або кур&apos;єр)</h3>
              <p className="opacity-80">
                Доставка по всій Україні відповідно до тарифів перевізника. Термін:{" "}
                <strong>1–3 робочі дні</strong>. Відправлення здійснюються щодня. Номер ТТН ви
                отримуєте після відправки.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Укрпошта</h3>
              <p className="opacity-80">
                Доставка по Україні згідно тарифів перевізника. Термін:{" "}
                <strong>3–5 робочих днів</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Самовивіз</h3>
              <p className="opacity-80">Можливий за попередньою домовленістю.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Оплата</h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Накладений платіж (Нова Пошта)</h3>
              <p className="opacity-80">Оплата при отриманні у відділенні.</p>
              <p className="opacity-80">
                Комісія перевізника: <strong>20 грн + 2%</strong> від суми замовлення.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Безкоштовна доставка</h2>
            <p className="opacity-80">
              При замовленні від <strong>2000 грн</strong> — доставка безкоштовна (Нова Пошта або
              Укрпошта).
            </p>
            <p className="opacity-80 font-semibold">Не враховуються:</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>пробники;</li>
              <li>мірні ємності;</li>
              <li>розпилювачі.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Важливо</h2>
            <ul className="space-y-3 opacity-80 list-disc pl-5">
              <li>При замовленні до 2000 грн — доставку оплачує отримувач.</li>
              <li>
                Стартові бокси та акційні набори зі знижками відправляються за рахунок отримувача
                незалежно від суми замовлення.
              </li>
            </ul>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">
              Актуальність інформації щодо доставки та оплат: за відображеними умовами при оформленні
              замовлення.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
