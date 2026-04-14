"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const scrollClass = "scroll-mt-[var(--site-header-offset)]";

const faqItems = [
  {
    number: "01",
    title: "Чи це оригінальна продукція Choice?",
    content: "Так. Усі продукти на сайті — оригінальна продукція виробника Choice.",
  },
  { number: "02", title: "Як обрати продукт?", content: "Ви можете обрати самостійно або звернутись за консультацією." },
  { number: "03", title: "Як швидко відправляється замовлення?", content: "Зазвичай протягом 1–2 робочих днів." },
  { number: "04", title: "Чи можна отримати консультацію?", content: "Так. Ви можете звернутись через email або месенджери." },
];

const brandFeatures = [
  { label: "ОРИГІНАЛЬНА ПРОДУКЦІЯ FORBODY", icon: "/images/choice-features/original-product.png" },
  { label: "ПРОДУКТИ ДЛЯ ЗДОРОВ'Я, ДОГЛЯДУ І ДОМУ", icon: "/images/choice-features/health-care-home.png" },
  { label: "РОСЛИННІ ФОРМУЛИ", icon: "/images/choice-features/plant-formulas.png" },
  { label: "ОФІЦІЙНИЙ ПРЕДСТАВНИК БРЕНДУ", icon: "/images/choice-features/official-badge.png" },
  { label: "КОНСУЛЬТАЦІЯ З ПІДБОРУ ПРОДУКТІВ", icon: "/images/choice-features/consultation.png" },
];

export default function InfoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF]">

      {/* ═══════════════════════════════════════════
          1. ПРО БРЕНД
      ═══════════════════════════════════════════ */}
      <section id="about" className={`w-full max-w-[1920px] mx-auto ${scrollClass}`}>
        <div className="pt-4 lg:pt-6 pb-16 lg:pb-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">

          {/* Хлібні крихти — вгорі як на сторінці каталогу */}
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-[#3D1A00]/60">
              <li>
                <Link href="/" className="hover:text-[#3D1A00] transition-colors">Головна</Link>
              </li>
              <li aria-hidden>|</li>
              <li className="text-[#3D1A00]">Про бренд</li>
            </ol>
          </nav>

          {/* Заголовок */}
          <h1
            className="text-center text-[#3D1A00] uppercase mb-14 lg:mb-16"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              fontSize: "clamp(40px, 8vw, 96px)",
              lineHeight: "159%",
              letterSpacing: "-0.02em",
            }}
          >
            Про бренд
          </h1>

          {/* Про бренд */}
          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              Про бренд
            </h2>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              ForBody — магазин, де є логіка, а не просто асортимент.
            </p>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              ForBody з&apos;явився як відповідь на просту ситуацію: у людей багато продуктів, але немає системи, як їх використовувати.
            </p>
            <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Тут зібрані позиції і готові набори, які поєднуються між собою і не створюють відчуття, що потрібно розбиратися у всьому з нуля.
            </p>
          </div>

          {/* Про мене */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 max-w-6xl mx-auto mb-14 lg:mb-16">
            <div className="lg:w-[420px] flex-shrink-0">
              <div className="relative w-full aspect-[4/5] max-w-[420px] rounded-lg overflow-hidden bg-[#D9D9D9]">
                <Image
                  src="/HL5A6046.jpg"
                  alt="Марія Максякова"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              </div>
            </div>
            <div className="flex-1 max-w-2xl space-y-4 font-['Montserrat'] text-[#3D1A00]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] text-[#3D1A00]">
                Про мене
              </h2>
              <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
                Марія Максякова. Вже 4 роки працюю з продукцією Choice і розвиваю власну мережу.
              </p>
              <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
                Це був свідомий вибір. Я орієнтуюсь на продукти, які можна зрозуміти по складу і логіці використання, а не тільки по обіцянках.
              </p>
              <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
                У роботі для мене важливо, щоб людина розуміла, що саме вона купує і як це використовувати в реальному житті.
              </p>
            </div>
          </div>

          {/* Про продукцію Choice */}
          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              Про продукцію Choice
            </h2>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Усі продукти на сайті виготовляє українська компанія Choice.
            </p>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Компанія працює з 2004 року і самостійно розробляє та виробляє продукцію. Це означає повний контроль процесу — від відбору сировини до готового продукту.
            </p>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Виробництво знаходиться в Україні, з дотриманням стандартів якості та лабораторним контролем на різних етапах.
            </p>
            <p className="text-[#3D1A00]/80 font-semibold mb-2" style={{ fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "159%" }}>
              Асортимент включає:
            </p>
            <ul className="space-y-2 list-none">
              {[
                "фітокомплекси",
                "функціональне харчування",
                "натуральну косметику",
                "екологічні засоби для дому",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[#3D1A00]/85" style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: "159%" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D1A00]/60 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Як створюється продукт */}
          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              Як створюється продукт
            </h2>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Choice працює з комплексними формулами, де компоненти підібрані для взаємодії між собою.
            </p>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Такий підхід дозволяє використовувати продукти у вигляді курсів або поєднувати їх між собою без зайвих експериментів.
            </p>
            <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              У частині продуктів застосовується технологія пророщених зерен, яка впливає на доступність поживних речовин для засвоєння.
            </p>
          </div>

          {/* Позиція і цінності Choice */}
          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              Позиція і цінності Choice
            </h2>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Choice — український виробник, який будує продукт на базі складу, технологій і довгострокового використання.
            </p>
            <p className="text-[#3D1A00]/80 font-semibold mb-2" style={{ fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "159%" }}>
              Основні принципи:
            </p>
            <ul className="space-y-2 mb-4 list-none">
              {[
                "використання рослинної сировини",
                "продумані поєднання компонентів",
                "системний підхід до створення продуктів",
                "відповідальність за якість на всіх етапах виробництва",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[#3D1A00]/85" style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: "159%" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D1A00]/60 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Компанія орієнтується на усвідомлене споживання і регулярне використання продуктів у повсякденному житті.
            </p>
          </div>

          {/* Що ви тут купуєте */}
          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              Що ви тут купуєте
            </h2>
            <p className="text-[#3D1A00]/85 mb-4" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              Асортимент сформований за принципом зручності та поєднуваності продуктів між собою.
            </p>
            <p className="text-[#3D1A00]/85" style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}>
              На сайті представлені як окремі позиції, так і готові набори, які вже мають продуману структуру використання. Це дозволяє обрати варіант під свій запит без необхідності самостійно комбінувати різні продукти.
            </p>
          </div>

          {/* Фічі бренду — на всю ширину як на головній */}
          <div className="w-full py-10 lg:py-14 mt-4">
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
              {brandFeatures.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]"
                >
                  <div className="relative w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0">
                    <Image
                      src={item.icon}
                      alt=""
                      fill
                      className="object-contain"
                      sizes="36px"
                    />
                  </div>
                  <span className="text-[#3D1A00] font-['Montserrat'] font-normal text-xs lg:text-sm leading-tight uppercase text-left">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. ПАРТНЕРСТВО
      ═══════════════════════════════════════════ */}
      <section id="partnership" className="w-full max-w-[1920px] mx-auto">
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="max-w-6xl mx-auto">
          {/* Заголовок: Montserrat 500, 64px, 159%, -2%, uppercase — в одну лінію з контентом */}
          <h2
            className="text-[#3D1A00] uppercase mb-10"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 500,
              fontSize: "clamp(32px, 5vw, 64px)",
              lineHeight: "159%",
              letterSpacing: "-0.02em",
            }}
          >
            Партнерство
          </h2>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 items-stretch">
            {/* Ліва: текст + список + кнопка — 50% на десктопі */}
            <div className="w-full lg:w-1/2 min-w-0 space-y-4 py-2 font-['Montserrat'] text-[#3D1A00]">
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(15px, 1.2vw, 18px)",
                  lineHeight: "159%",
                }}
                className="text-[#3D1A00]/80"
              >
                ForBody пропонує можливість співпраці для тих, хто хоче працювати у сфері wellness і eco-продуктів, та отримувати додатковий дохід.
              </p>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(15px, 1.2vw, 18px)",
                }}
                className="text-[#3D1A00]/90"
              >
                Партнери отримують:
              </p>
              <ul className="space-y-1.5">
                {[
                  "доступ до продукції бренду",
                  "навчання і підтримку",
                  "можливість створювати дохід",
                  "доступ до спільноти",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-[#3D1A00]/80"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "clamp(14px, 1.1vw, 17px)",
                      lineHeight: "159%",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3D1A00]/50 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4 w-full">
                <Link
                  href="/partnership"
                  className="inline-flex items-center justify-center w-full px-8 py-3.5 bg-white border border-[#3D1A00]/20 text-[#3D1A00] uppercase font-['Montserrat'] font-semibold tracking-widest hover:border-[#3D1A00]/40 hover:bg-[#3D1A00]/5 transition-colors text-sm"
                  style={{ letterSpacing: "0.1em" }}
                >
                  Детальніше
                </Link>
              </div>
            </div>

            {/* Права: фото — 50% на десктопі */}
            <div className="w-full lg:w-1/2 min-w-0 mt-10 lg:mt-0 lg:pl-5">
              <div className="relative w-full aspect-[16/10] min-h-[200px] lg:min-h-[280px] rounded-lg overflow-hidden bg-[#D9D9D9]">
                <Image
                  src="/images/choice-features/hf_20260307_174928_45490834-1da6-4ee5-b317-cc4fa3a4fcc1.png"
                  alt="Партнерство з ForBody"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. ЧАСТІ ЗАПИТАННЯ
      ═══════════════════════════════════════════ */}
      <section id="faq" className={`w-full max-w-[1920px] mx-auto ${scrollClass}`}>
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="flex flex-col lg:flex-row max-w-6xl mx-auto items-stretch gap-10 lg:gap-0 font-['Montserrat'] text-[#3D1A00]">

            {/* Ліва колонка: акордеон — 50% на десктопі */}
            <div className="w-full lg:w-1/2 min-w-0 order-2 lg:order-1 lg:pr-5">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index + 1;
                return (
                  <div key={index} className="border-b border-[#3D1A00]/10 last:border-b-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index + 1)}
                      className="w-full flex items-center justify-between py-6 lg:py-8 gap-4 text-left group"
                    >
                      <div className="flex items-center gap-6 lg:gap-8 min-w-0">
                        {/* Номер: жирний (700), темний, великий */}
                        <span
                          className="text-[#3D1A00] flex-shrink-0 tabular-nums font-bold"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 700,
                            fontSize: "clamp(28px, 3vw, 40px)",
                            lineHeight: 1,
                          }}
                        >
                          {item.number}
                        </span>
                        <h3
                          className="text-[#3D1A00]"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 400,
                            fontSize: "clamp(14px, 1.2vw, 18px)",
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      {/* Кругла кнопка з рамкою: + / − */}
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#3D1A00]/30 bg-white flex items-center justify-center text-[#3D1A00] transition-colors group-hover:border-[#3D1A00]/50"
                        aria-hidden
                        style={{ fontFamily: "Montserrat, sans-serif", fontSize: 18, fontWeight: 400 }}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div
                        className="pb-6 lg:pb-8 pl-0 lg:pl-8 text-[#3D1A00]/70"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "clamp(14px, 1.1vw, 17px)",
                          lineHeight: "159%",
                        }}
                      >
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Права колонка: великий заголовок + підзаголовок — зліва на мобільному, справа на десктопі */}
            <div className="w-full lg:w-1/2 min-w-0 order-1 lg:order-2 lg:pl-5 flex flex-col justify-center text-left lg:text-right">
              <h2
                className="text-[#3D1A00] uppercase leading-[159%] tracking-[-0.02em] mb-4 font-['Montserrat'] font-medium text-3xl sm:text-4xl lg:text-[64px]"
              >
                Часті запитання
              </h2>
              <p
                className="text-[#3D1A00]/70"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1vw, 16px)",
                  lineHeight: "159%",
                }}
              >
                Відповіді на популярні запитання про продукцію та замовлення
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. ДОСТАВКА ТА ОПЛАТА
      ═══════════════════════════════════════════ */}
      <section id="delivery" className="w-full max-w-[1920px] mx-auto">
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="max-w-6xl mx-auto">
          {/* Заголовок — в одну лінію з контентом */}
          <h2 className="text-[#3D1A00] uppercase leading-[159%] tracking-[-0.02em] mb-16 lg:mb-20 font-['Montserrat'] font-medium text-3xl sm:text-4xl lg:text-[64px]">
            Доставка та оплата
          </h2>

          <div className="space-y-20 lg:space-y-28">

            {/* ОПЛАТА: на комп — блок правіше */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="lg:w-[260px] flex-shrink-0 text-left pt-2">
                <h3
                  className="text-[#3D1A00] uppercase"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    fontSize: "clamp(24px, 3vw, 40px)",
                    lineHeight: "159%",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Оплата
                </h3>
              </div>
              <div className="flex-1 space-y-10">
                {[
                  {
                    num: "01",
                    title: "Безготівковим розрахунком",
                    sub: "MonoPay",
                  },
                  {
                    num: "02",
                    title: "Накладений платіж",
                    sub: "Замолення оплачується готівкою на відділенні Нової пошти/УкрПошти при отриманні або кур'єру в момент доставки",
                  },
                ].map((p) => (
                  <div key={p.num} className="flex gap-6 items-baseline">
                    <span
                      className="text-[#3D1A00]/15 flex-shrink-0 tabular-nums font-['Montserrat'] font-normal"
                      style={{
                        fontSize: "clamp(64px, 12vw, 128px)",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {p.num}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[#3D1A00] uppercase font-semibold"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "clamp(12px, 1vw, 14px)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {p.title}
                      </p>
                      {p.sub && (
                        <p
                          className="text-[#3D1A00]/60 mt-1"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 400,
                            fontSize: "clamp(12px, 1vw, 14px)",
                            lineHeight: "159%",
                          }}
                        >
                          {p.sub}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ДОСТАВКА: на мобільній зліва */}
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              <div className="lg:w-[260px] flex-shrink-0 text-left pt-2">
                <h3
                  className="text-[#3D1A00] uppercase"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    fontSize: "clamp(24px, 3vw, 40px)",
                    lineHeight: "159%",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Доставка
                </h3>
                <p
                  className="text-[#3D1A00]/50 mt-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 400,
                    fontSize: "clamp(11px, 0.9vw, 13px)",
                    lineHeight: "159%",
                  }}
                >
                  Відправка вашого замовлення здійснюється наступного дня після оформлення
                </p>
              </div>
              <div className="flex-1 space-y-10">
                {[
                  { num: "01", title: "Доставка у відділення Нової пошти / УкрПошти" },
                  { num: "02", title: "Кур'єрська доставка Нової пошти за вказаною вами адресою" },
                ].map((p) => (
                  <div key={p.num} className="flex gap-6 items-baseline">
                    <span
                      className="text-[#3D1A00]/15 flex-shrink-0 tabular-nums font-['Montserrat'] font-normal"
                      style={{
                        fontSize: "clamp(64px, 12vw, 128px)",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {p.num}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-[#3D1A00] uppercase font-semibold"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: "clamp(12px, 1vw, 14px)",
                          letterSpacing: "0.08em",
                          lineHeight: "159%",
                        }}
                      >
                        {p.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

    </div>
  );
}