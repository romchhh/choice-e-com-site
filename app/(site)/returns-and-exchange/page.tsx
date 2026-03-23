import type { Metadata } from "next";
import Link from "next/link";

const baseUrl =
  process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Повернення та обмін | Choice",
  description:
    "Обмін і повернення: перевірка замовлень, невідповідність і пошкодження, 14 днів для товару належної якості, обмеження за постановою КМУ №172, перевірка при отриманні.",
  openGraph: {
    title: "Повернення та обмін | Choice",
    description:
      "Умови обміну та повернення, контакт для звернень і юридичні підстави.",
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
            <h2 className="text-2xl md:text-3xl font-semibold">Обмін та повернення</h2>
            <p className="opacity-80">
              Кожне замовлення перевіряється перед відправкою. Якщо виникає питання — ми
              оперативно його вирішуємо.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Невідповідність або пошкодження</h2>
            <p className="opacity-80">Якщо при отриманні ви виявили:</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>інший товар;</li>
              <li>пошкоджену упаковку;</li>
              <li>виробничий брак.</li>
            </ul>
            <p className="opacity-80">
              📩 Напишіть:{" "}
              <a
                href="mailto:mari.choice26@gmail.com"
                className="font-semibold underline underline-offset-2 hover:opacity-100"
              >
                mari.choice26@gmail.com
              </a>
            </p>
            <p className="opacity-80">Додайте фото товару.</p>
            <p className="opacity-80">
              Після перевірки ми запропонуємо рішення: обмін, повернення коштів або інший варіант.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Повернення товару належної якості</h2>
            <p className="opacity-80">
              Повернення можливе протягом <strong>14 днів</strong> з моменту отримання.
            </p>
            <p className="opacity-80 font-semibold">Умови:</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>товар не використовувався;</li>
              <li>збережений товарний вигляд та упаковка.</li>
            </ul>
            <p className="opacity-80">
              Відповідно до ст. 9 Закону України «Про захист прав споживачів», ви маєте право:
            </p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>обміняти товар;</li>
              <li>обрати інший із перерахунком вартості;</li>
              <li>отримати повернення коштів;</li>
              <li>здійснити обмін після надходження товару в продаж.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Обмеження</h2>
            <p className="opacity-80">
              Згідно з постановою КМУ №172 від 19.03.1994 р., не підлягають обміну та поверненню:
            </p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>продовольчі товари;</li>
              <li>лікарські засоби;</li>
              <li>засоби гігієни;</li>
              <li>парфумерно-косметична продукція;</li>
              <li>інші товари, визначені законодавством.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Юридичні умови</h2>
            <p className="opacity-80">
              Споживач має право обміняти непродовольчий товар належної якості, якщо він не підійшов за
              формою, розміром, фасоном чи з інших причин не може бути використаний за призначенням.
            </p>
            <p className="opacity-80">
              Обмін або повернення здійснюється протягом <strong>14 днів</strong> (без урахування дня
              покупки) за умови збереження товарного вигляду.
            </p>
            <p className="opacity-80">Якщо аналогічного товару немає в наявності, споживач має право:</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>придбати інший товар із перерахунком вартості;</li>
              <li>розірвати договір та отримати кошти;</li>
              <li>здійснити обмін після надходження товару.</li>
            </ul>
            <p className="opacity-80">Продавець зобов&apos;язаний повідомити про надходження товару.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Перевірка при отриманні</h2>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              <li>Усі відправлення застраховані.</li>
              <li>Перевіряйте замовлення у відділенні або при кур&apos;єрі.</li>
              <li>У разі пошкодження — оформіть акт на місці.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
