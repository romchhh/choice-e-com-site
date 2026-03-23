import type { Metadata } from "next";
import Link from "next/link";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Доставка та оплата | Choice",
  description:
    "Способи доставки та оплати для замовлень в інтернет-магазині Choice: Нова Пошта, Укрпошта, самовивіз, а також доступні варіанти оплати.",
  openGraph: {
    title: "Доставка та оплата | Choice",
    description:
      "Способи доставки та оплати для замовлень в інтернет-магазині Choice.",
    type: "article",
    locale: "uk_UA",
    url: `${baseUrl}/delivery-and-payment`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: "CHOICE — доставка та оплата",
      },
    ],
    siteName: "Choice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Доставка та оплата | Choice",
    description:
      "Способи доставки та оплати для замовлень в інтернет-магазині Choice.",
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
            <h2 className="text-2xl md:text-3xl font-semibold">
              Способи доставки
            </h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Адресна доставка кур'єром Нової Пошти
              </h3>
              <p className="opacity-80">
                По всій Україні. Вартість і умови доставки згідно тарифів
                Нової пошти.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Доставка Укрпошта</h3>
              <p className="opacity-80">
                Вартість доставки: Укрпошта згідно тарифів перевізника.
              </p>
              <p className="opacity-80">
                При виборі Укрпошта передбачена тільки ПОВНА ПЕРЕДОПЛАТА
                товару! При терміні доставки по Україні від 3 до 5 днів
                стільки ж виходить і зворотна доставка коштів. Дякуємо за
                розуміння!
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Самовивіз</h3>
              <p className="opacity-80">
                Самовивіз здійснюється кожен день з 09:00 до 18:00 (крім
                неділі з 09:00 до 15:00).
              </p>
              <p className="opacity-80">
                Адреса самовивозу: <strong>Україна, 49069, Дніпропетровська обл., місто Дніпро, вулиця Січових Стрільців, будинок 127а, квартира 5</strong>.
              </p>
              <p className="opacity-80">
                Як оформити замовлення: Оформіть замовлення на самовивіз на сайті.
                Про готовність вашого замовлення ми проінформуємо по електронній
                пошті і SMS.
              </p>
              <p className="opacity-80">
                Як отримати замовлення: приїжджайте в пункт самовивозу, повідомте номер
                замовлення, оплачуйте та забирайте своє замовлення. Перед тим як їхати,
                переконайтеся, що у Вас є номер замовлення (він є в листі замовлення або в SMS-повідомленні).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Доставка Нова Пошта</h3>
              <p className="opacity-80">
                Вартість доставки Нова Пошта становить від 40 грн залежно від ваги і
                габаритів вантажу.
              </p>
              <p className="opacity-80">
                При виборі післяплати Ви доплачуєте 20 грн + 2% від вартості замовлення
                за повернення грошових коштів нам.
              </p>
              <p className="opacity-80">
                Термін доставки: від 1 до 3 робочих днів. Посилки Нової Пошти відправляються
                щодня. Номери декларацій надсилаються SMS-повідомленням.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Способи оплати
            </h2>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Передоплата</h3>
              <p className="opacity-80">
                Онлайн-оплата через MonoPay (після оформлення замовлення).
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Післяплата “Нова Пошта”</h3>
              <p className="opacity-80">
                Накладений платіж — оплата при отриманні посилки у відділенні Нової Пошти, без
                обов’язкової онлайн-передоплати при оформленні. Повну вартість замовлення можна
                сплатити заздалегідь через MonoPay (повна оплата при оформленні).
              </p>
            </div>


            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Оплата картою Visa, Mastercard — MonoPay
              </h3>
            </div>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">
              Актуальність інформації щодо доставки та оплат: за відображеними умовами при оформленні замовлення.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

