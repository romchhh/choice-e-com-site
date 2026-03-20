import type { Metadata } from "next";
import Link from "next/link";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Повернення та обмін | Choice",
  description:
    "Повернення та обмін товарів: строки, умови для товарів належної та неналежної якості, адреса та контакти менеджера.",
  openGraph: {
    title: "Повернення та обмін | Choice",
    description:
      "Повернення та обмін товарів: строки, умови, адреса і контакти.",
    type: "article",
    locale: "uk_UA",
    url: `${baseUrl}/returns-and-exchange`,
    images: [
      {
        url: `${baseUrl}/images/tg_image_3614117882.png`,
        width: 1200,
        height: 630,
        alt: "CHOICE — повернення та обмін",
      },
    ],
    siteName: "Choice",
  },
};

export default function ReturnsAndExchangePage() {
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
            Повернення та обмін
          </h1>
          <div className="w-20 h-1 bg-black mt-6" />
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            <p className="opacity-80">
              Компанія здійснює повернення та обмін товарів належної якості згідно
              Закону «Про захист прав споживачів».
            </p>

            <p className="opacity-80">
              Обмін та повернення товарів здійснюється поштовою компанією «Нова
              пошта» або за адресою: <strong>вул. Лугова 170 (81100), Львів, Україна</strong>.
            </p>

            <p className="opacity-80">
              Для вирішення питань обміну та повернення товарів — зателефонуйте
              нашому менеджеру: <strong>+380960000000</strong>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Строки повернення і обміну</h2>
            <ul className="space-y-3 opacity-80 list-disc pl-5">
              <li>
                Повернення та обмін товарів можливий протягом <strong>14 днів</strong>{" "}
                після отримання товару покупцем.
              </li>
              <li>
                Зворотня доставка товарів здійснюється за домовленістю.
              </li>
            </ul>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Умови повернення для товарів належної якості</h2>

            <p className="opacity-80">
              Відповідно до статті 9 Закону України «Про захист прав споживачів» існує дві
              причини, через які покупець може повернути або обміняти куплений товар:
            </p>

            <ol className="space-y-3 opacity-80 list-decimal pl-5">
              <li>якщо товар не відповідає якості про яку заявляв виробник;</li>
              <li>
                якщо товар повністю відповідає всім вимогам, але з якоїсь причини не влаштовує покупця.
              </li>
            </ol>

            <p className="opacity-80">
              Повернення здійснюється використовуючи транспортні послуги компанії «Нова пошта».
            </p>

            <p className="opacity-80 font-semibold">Повернення повинно бути належної якості, а саме:</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>товарна упаковка не пошкоджена;</li>
              <li>комплектація повна;</li>
              <li>відсутні будь-які механічні пошкодження;</li>
              <li>відсутні сліди користування.</li>
            </ul>

            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>Повернення відправлення можливе впродовж <strong>14 днів</strong> з моменту отримання.</li>
              <li>Повернення здійснюється за рахунок <strong>Відправника</strong>.</li>
              <li>
                Повернення коштів здійснюється зручним для клієнта способом протягом <strong>3-х робочих днів</strong>{" "}
                після отримання та перевірки продавцем товару.
              </li>
            </ul>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">Умови повернення товарів неналежної якості</h2>

            <p className="opacity-80">
              Згідно статті 8 Закону України «Про захист прав споживачів» у разі виявлення протягом
              встановленого гарантійного строку недоліків споживач, в порядку та в строки, встановлені
              законодавством, має право вимагати:
            </p>

            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>пропорційного зменшення ціни;</li>
              <li>безоплатного усунення недоліків товару;</li>
              <li>відшкодування витрат на усунення недоліків товару.</li>
            </ul>

            <p className="opacity-80">
              Якщо виявлені недоліки товару не підлягають ремонту, Клієнт може запросити
              заміну товару або ж повернення коштів.
            </p>

            <p className="opacity-80 font-semibold">
              Інформування про отримання товару неналежної якості повинно бути виконано в перші 24 години після отримання:
            </p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>телефонним дзвінком;</li>
              <li>повідомленням на електронну пошту: <strong>maksyakovamasha@gmail.com</strong>;</li>
              <li>або в мессенджері Viber за номером телефону: <strong>+380975292173</strong>.</li>
            </ul>

            <p className="opacity-80">
              Вимоги споживача, передбачені цією статтею, не підлягають втіленню, якщо продавець
              (або виробник) доведуть, що недоліки виникли внаслідок порушення споживачем правил користування товаром або його зберігання.
              Споживач має право брати участь у перевірці якості товару особисто або через свого представника.
            </p>

            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>Повернення здійснюється за рахунок <strong>Отримувача</strong>.</li>
              <li>
                Повернення коштів здійснюється зручним для клієнта способом протягом <strong>3-х робочих днів</strong>{" "}
                після отримання та перевірки продавцем товару.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Відмова в обміні та поверненні
            </h2>
            <p className="opacity-80">
              Згідно із Законом «Про захист прав споживачів», компанія може відмовити споживачеві в обміні та поверненні товарів належної якості,
              якщо вони відносяться до категорій, що зазначені у чинному Переліку непродовольчих товарів належної якості,
              не підлягають поверненню та обміну.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

