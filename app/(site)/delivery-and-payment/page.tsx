import type { Metadata } from "next";
import Link from "next/link";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: `Доставка та оплата | ${SITE_STORE_NAME}`,
  description:
    "Оплата карткою, Google Pay, Apple Pay, на карту ФОП, післяплата в НП. Доставка Новою Поштою (відділення, поштомат, кур'єром) та Укрпоштою. Терміни та тарифи.",
  openGraph: {
    title: `Доставка та оплата | ${SITE_STORE_NAME}`,
    description:
      "Умови доставки Новою Поштою та Укрпоштою, усі способи оплати, післяплата та комісії перевізника.",
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

        <div className="space-y-14 text-base leading-relaxed">
          {/* Оплата */}
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Оплата</h2>
            <p className="opacity-90">
              Оплатити замовлення можна будь-яким зручним способом:
            </p>
            <ul className="space-y-3 opacity-90 list-disc pl-5 marker:text-black">
              <li>
                <strong>Банківською карткою</strong> (VISA / Mastercard) — під час оформлення
                замовлення на сайті.
              </li>
              <li>
                <strong>Онлайн-сервісами Google Pay, Apple Pay</strong> — під час оформлення
                замовлення на сайті.
              </li>
              <li>
                <strong>На картку або реквізити ФОП</strong> — за реквізитами, які надаємо після
                узгодження замовлення.
              </li>
              <li>
                <strong>Післяплатою у відділенні «Нової пошти»</strong> — без передоплати.
              </li>
            </ul>
          </section>

          {/* Комісії */}
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Комісії</h2>
            <p className="opacity-90">
              Комісія за післяплату (грошовий переказ) НП: <strong>2% + 20 грн</strong>.
            </p>
            <p className="opacity-90">Комісія від оголошеної вартості:</p>
            <ul className="space-y-2 opacity-90 list-disc pl-5">
              <li>
                до 500 грн — <strong>включена у тариф</strong>;
              </li>
              <li>
                понад 500 грн — <strong>0,5%</strong> від суми.
              </li>
            </ul>
            <p className="opacity-80 text-sm">
              Усі ціни вказані у гривнях (з ПДВ) та дійсні з <strong>01.01.2024</strong>.
            </p>
            <p className="opacity-90">
              Актуальні тарифи «Нової пошти» можна переглянути за посиланням:{" "}
              <a
                href="https://novaposhta.ua/shipping-cost"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3D1A00] underline font-medium hover:opacity-80"
              >
                novaposhta.ua/shipping-cost
              </a>
            </p>
          </section>

          {/* Доставка */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Доставка</h2>
            <p className="opacity-90 font-medium">Вартість доставки залежить від суми замовлення та способу отримання:</p>
            <ul className="space-y-2 opacity-90 list-disc pl-5">
              <li>
                <strong>Від 80 грн</strong> — стандартна вартість доставки (залежно від розміру та
                ваги замовлення за тарифами перевізника).
              </li>
              <li>
                <strong>Безкоштовно</strong> — при замовленні від <strong>2000 грн</strong> (за
                відсутності інших акцій).
              </li>
            </ul>

            <div className="space-y-3 pt-2">
              <h3 className="text-xl font-semibold">Способи доставки</h3>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                <li>
                  До <strong>відділення</strong> або <strong>поштомату</strong> «Нової пошти».
                </li>
                <li>
                  <strong>Адресна доставка кур’єром «Нової пошти»</strong> — до вказаної вами адреси
                  (квартира, офіс тощо). Замовлення передається перевізнику за стандартними правилами
                  НП; після відправлення ви отримаєте трек-номер для відстеження.
                </li>
                <li>
                  До відділення <strong>«Укрпошти»</strong>.
                </li>
              </ul>
              <p className="opacity-80 text-sm pl-1 border-l-2 border-[#3D1A00]/20 pl-4">
                Терміни адресної доставки кур’єром у межах України зазвичай збігаються з термінами
                «Нової пошти» для вашого напрямку (див. блок «Терміни доставки по Україні» нижче).
              </p>
            </div>
          </section>

          {/* Терміни */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Терміни доставки по Україні</h2>

            <div className="space-y-3 rounded-lg border border-black/10 p-5 bg-black/[0.02]">
              <h3 className="text-xl font-semibold">Нова пошта</h3>
              <p className="text-sm opacity-70 mb-2">
                Відділення, поштомат або кур’єр на адресу — орієнтовні терміни за даними{" "}
                <a
                  href="https://novaposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#3D1A00] hover:opacity-80"
                >
                  novaposhta.ua
                </a>
                :
              </p>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                <li>у межах одного міста — <strong>до 1 дня</strong>;</li>
                <li>
                  між обласними центрами або великими містами — <strong>1–2 дні</strong>;
                </li>
                <li>у віддалені населені пункти — <strong>до 3 днів</strong>.</li>
              </ul>
            </div>

            <div className="space-y-3 rounded-lg border border-black/10 p-5 bg-black/[0.02]">
              <h3 className="text-xl font-semibold">Укрпошта</h3>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                <li>
                  <strong>4–7 робочих днів</strong> (залежно від регіону та обсягу відправлень).
                </li>
              </ul>
            </div>

            <p className="opacity-90">
              Доставка здійснюється перевізниками <strong>«Нова Пошта»</strong> або{" "}
              <strong>«Укрпошта»</strong>. Після відправлення замовлення ви отримаєте SMS або
              повідомлення з трек-номером.
            </p>
            <p className="opacity-90">
              Замовлення зберігається у відділенні <strong>до 7 робочих днів</strong>, після чого
              повертається відправнику.
            </p>
            <p className="opacity-90">
              Ознайомитися з графіком роботи відділень можна тут:
            </p>
            <ul className="space-y-2 opacity-90 list-none pl-0">
              <li>
                👉{" "}
                <a
                  href="https://novaposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3D1A00] underline font-medium hover:opacity-80"
                >
                  Графік роботи «Нової пошти» — novaposhta.ua
                </a>
              </li>
              <li>
                👉{" "}
                <a
                  href="https://ukrposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3D1A00] underline font-medium hover:opacity-80"
                >
                  Графік роботи «Укрпошти» — ukrposhta.ua
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-4 pt-4 border-t border-black/10">
            <h2 className="text-xl font-semibold">Додатково</h2>
            <p className="opacity-80">
              Самовивіз можливий за попередньою домовленістю — уточнюйте при оформленні замовлення.
            </p>
            <p className="opacity-80">
              При замовленні <strong>до 2000 грн</strong> доставку зазвичай оплачує отримувач згідно
              з тарифами перевізника (окрім акційних умов).
            </p>
            <p className="opacity-80">
              Безкоштовна доставка від 2000 грн <strong>не враховує</strong> окремі позиції
              (пробники, мірні ємності, розпилювачі тощо) — деталі уточнюйте при замовленні.
            </p>
          </section>

          <section className="pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">
              Актуальні умови оплати та доставки також відображаються під час оформлення замовлення на
              сайті {SITE_STORE_NAME}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
