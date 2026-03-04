import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Партнерство з CHOICE | Choice",
  description:
    "Деталі співпраці з CHOICE: як працює команда, які можливості партнерства та що ви отримуєте, приєднавшись.",
};

export default function PartnershipPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF]">
      <section className="w-full max-w-[1920px] mx-auto scroll-mt-[7.75rem]">
        <div className="pt-4 lg:pt-6 pb-20 px-3 lg:px-8">
          {/* Хлібні крихти */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-[#3D1A00]/60">
              <li>
                <Link href="/" className="hover:text-[#3D1A00] transition-colors">
                  Головна
                </Link>
              </li>
              <li aria-hidden>|</li>
              <li>
                <Link href="/info#partnership" className="hover:text-[#3D1A00] transition-colors">
                  Про бренд і партнерство
                </Link>
              </li>
              <li aria-hidden>|</li>
              <li className="text-[#3D1A00]">Партнерство</li>
            </ol>
          </nav>

          {/* Заголовок сторінки */}
          <h1
            className="text-center text-[#3D1A00] uppercase mb-10 lg:mb-14"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(40px, 8vw, 72px)",
              lineHeight: "140%",
              letterSpacing: "-0.02em",
            }}
          >
            Співпраця з CHOICE
          </h1>

          {/* Вступний блок: текст + колаж фото */}
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16 lg:mb-20 items-start">
            <div className="w-full lg:w-1/2 space-y-4 font-['Montserrat'] text-[#3D1A00]">
              <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                Більшість людей приходять у мережевий з однією надією — заробити. І дуже швидко
                розчаровуються, бо їм не пояснюють систему.
              </p>
              <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                Я працюю інакше.
              </p>
              <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                У моїй команді ми не продаємо “чарівні баночки”. Ми будуємо систему: допомагаємо людям
                розібратись у здоров&apos;ї, підбираємо рішення і формуємо довгострокову клієнтську базу.
              </p>
              <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                Це не історія про швидкі гроші. Це можливість створити стабільний дохід, працюючи з
                продуктом, який люди реально використовують щодня.
              </p>
              <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                Якщо тобі близький системний підхід і ти готовий розвиватися — тоді нам по дорозі.
              </p>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#D9D9D9]">
                  <Image
                    src="/images/partnership/0068.jpg"
                    alt="Партнерство з CHOICE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority
                  />
                </div>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#D9D9D9]">
                  <Image
                    src="/images/partnership/HL5A6060.jpg"
                    alt="Команда CHOICE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#D9D9D9]">
                  <Image
                    src="/images/partnership/HL5A6096.jpg"
                    alt="Партнерська зустріч CHOICE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#D9D9D9]">
                  <Image
                    src="/images/partnership/HL5A8688.jpg"
                    alt="Розвиток у команді CHOICE"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Чому варто приєднатись саме до моєї команди */}
          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              Чому варто приєднатись саме до моєї команди
            </h2>
            <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85 mb-4">
              У CHOICE багато партнерів, але результат часто залежить не від компанії, а від команди, в
              яку ти потрапляєш. Я будую команду з фокусом на системній роботі і розвитку кожного партнера.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-[0.08em]">
                  Чітка стратегія старту
                </h3>
                <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/80">
                  Новачок не залишається сам із питанням “що робити далі”. Ми розписуємо перші кроки,
                  пояснюємо логіку роботи і допомагаємо запустити перші результати.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-[0.08em]">
                  Реальна підтримка
                </h3>
                <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/80">
                  Партнери завжди можуть звернутися за порадою: від підбору продукту клієнту до розвитку
                  власного блогу чи сторінки.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-[0.08em]">
                  Навчання, яке можна застосувати
                </h3>
                <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/80">
                  Ми розбираємо, як працювати з клієнтами, як будувати особистий бренд, як вести соціальні
                  мережі, як формувати стабільний товарообіг. Це знання, які працюють не тільки в мережевому
                  бізнесі.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-[0.08em]">
                  Командна атмосфера
                </h3>
                <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/80">
                  У нас немає гонки і тиску. Є люди, які хочуть рости, підтримують одне одного і рухаються
                  вперед.
                </p>
              </div>
            </div>
          </div>

          {/* Що ти отримуєш у партнерстві */}
          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              Що ти отримуєш у партнерстві
            </h2>
            <ul className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                <span>доступ до продукції за цінами виробника</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                <span>можливість отримувати кешбек від товарообігу клієнтів</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                <span>навчання і підтримку команди</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                <span>інструменти для онлайн та офлайн роботи</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                <span>перспективу розвитку власної команди</span>
              </li>
            </ul>
          </div>

          {/* Кому підійде співпраця */}
          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              Кому підійде співпраця
            </h2>
            <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/85 mb-4">
              Людям, які:
            </p>
            <ul className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85">
              <li>— цікавляться здоров&apos;ям і хочуть у цьому розібратись</li>
              <li>— шукають додатковий або основний дохід</li>
              <li>— готові вчитися і діяти</li>
              <li>— хочуть працювати в команді</li>
            </ul>
          </div>

          {/* Запрошення + CTA */}
          <div className="max-w-4xl mx-auto font-['Montserrat'] text-[#3D1A00]">
            <div className="bg-[#FFF9F0] border border-[#3D1A00]/10 rounded-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4">
                Запрошення
              </h2>
              <div className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85 mb-6">
                <p>
                  Якщо тобі відгукується цей формат співпраці — ти можеш приєднатися до команди вже зараз.
                </p>
                <p>
                  Натискай кнопку нижче та проходь реєстрацію в компанії CHOICE. Після реєстрації ти
                  автоматично потрапляєш у мою команду.
                </p>
                <p>
                  Я зв&apos;яжуся з тобою, щоб допомогти розібратись із першими кроками, показати систему
                  роботи і відповісти на всі запитання.
                </p>
              </div>

              <div className="flex flex-col items-stretch sm:items-start gap-4">
                <Link
                  href="http://cabinet.choice.ua/user/regref?ref=5b3e3&lang=uk_UA"
                  className="inline-flex w-full items-center justify-center px-8 py-3.5 rounded-full bg-[#3D1A00] text-white text-sm sm:text-base font-semibold uppercase tracking-[0.14em] hover:bg-[#3D1A00]/90 transition-colors text-center underline decoration-white/70 underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Реєстрація в команду
                </Link>

                <div className="mt-1 inline-flex flex-col gap-2 text-xs sm:text-sm leading-[159%] text-[#3D1A00]/80 bg-white/70 border border-[#3D1A00]/10 rounded-xl px-4 py-3 max-w-xl">
                  <p className="font-semibold text-[#3D1A00]">
                    Після реєстрації ви отримуєте:
                  </p>
                  <ul className="space-y-1">
                    <li>• доступ до особистого кабінету</li>
                    <li>• ціни виробника на продукцію</li>
                    <li>• навчальні матеріали</li>
                    <li>• підтримку команди</li>
                  </ul>
                  <p className="text-[11px] sm:text-xs text-[#3D1A00]/60 mt-1">
                    Натискання кнопки відкриє офіційний сайт CHOICE в новій вкладці для заповнення реєстраційної форми.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

