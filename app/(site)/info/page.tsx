"use client";

import Image from "next/image";
import { useState } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getInfoCopy } from "@/lib/i18n/content/info";

const scrollClass = "scroll-mt-[var(--site-header-offset)]";

export default function InfoPage() {
  const { locale } = useLocale();
  const t = getInfoCopy(locale);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF]">
      <section id="about" className={`w-full max-w-[1920px] mx-auto ${scrollClass}`}>
        <div className="pt-4 lg:pt-6 pb-16 lg:pb-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-[#3D1A00]/60">
              <li>
                <LocaleLink href="/" className="hover:text-[#3D1A00] transition-colors">
                  {t.home}
                </LocaleLink>
              </li>
              <li aria-hidden>|</li>
              <li className="text-[#3D1A00]">{t.breadcrumb}</li>
            </ol>
          </nav>

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
            {t.pageTitle}
          </h1>

          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              {t.aboutBrandTitle}
            </h2>
            {t.aboutBrandParas.map((p, i) => (
              <p
                key={i}
                className={`text-[#3D1A00]/85${i < t.aboutBrandParas.length - 1 ? " mb-4" : ""}`}
                style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 max-w-6xl mx-auto mb-14 lg:mb-16">
            <div className="lg:w-[420px] flex-shrink-0">
              <div className="relative w-full aspect-[4/5] max-w-[420px] rounded-lg overflow-hidden bg-[#D9D9D9]">
                <Image
                  src="/HL5A6046.jpg"
                  alt={t.aboutMePhotoAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
              </div>
            </div>
            <div className="flex-1 max-w-2xl space-y-4 font-['Montserrat'] text-[#3D1A00]">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] text-[#3D1A00]">
                {t.aboutMeTitle}
              </h2>
              {t.aboutMeParas.map((p) => (
                <p
                  key={p.slice(0, 40)}
                  className="text-[#3D1A00]/85"
                  style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              {t.aboutProductsTitle}
            </h2>
            {t.aboutProductsParas.map((p) => (
              <p
                key={p.slice(0, 40)}
                className="text-[#3D1A00]/85 mb-4"
                style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
              >
                {p}
              </p>
            ))}
            <p
              className="text-[#3D1A00]/80 font-semibold mb-2"
              style={{ fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "159%" }}
            >
              {t.assortmentLabel}
            </p>
            <ul className="space-y-2 list-none">
              {t.assortment.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[#3D1A00]/85"
                  style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: "159%" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D1A00]/60 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              {t.howCreatedTitle}
            </h2>
            {t.howCreatedParas.map((p, i) => (
              <p
                key={i}
                className={`text-[#3D1A00]/85${i < t.howCreatedParas.length - 1 ? " mb-4" : ""}`}
                style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              {t.valuesTitle}
            </h2>
            <p
              className="text-[#3D1A00]/85 mb-4"
              style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
            >
              {t.valuesIntro}
            </p>
            <p
              className="text-[#3D1A00]/80 font-semibold mb-2"
              style={{ fontSize: "clamp(14px, 1.1vw, 16px)", lineHeight: "159%" }}
            >
              {t.principlesLabel}
            </p>
            <ul className="space-y-2 mb-4 list-none">
              {t.principles.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[#3D1A00]/85"
                  style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: "159%" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D1A00]/60 flex-shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p
              className="text-[#3D1A00]/85"
              style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
            >
              {t.valuesOutro}
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-14 lg:mb-16 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4 text-[#3D1A00]">
              {t.whatYouBuyTitle}
            </h2>
            {t.whatYouBuyParas.map((p, i) => (
              <p
                key={i}
                className={`text-[#3D1A00]/85${i < t.whatYouBuyParas.length - 1 ? " mb-4" : ""}`}
                style={{ fontSize: "clamp(15px, 1.2vw, 18px)", lineHeight: "159%" }}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="w-full py-10 lg:py-14 mt-4">
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
              {t.brandFeatures.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]"
                >
                  <div className="relative w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0">
                    <Image src={item.icon} alt="" fill className="object-contain" sizes="36px" />
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

      <section id="partnership" className="w-full max-w-[1920px] mx-auto">
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="max-w-6xl mx-auto">
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
              {t.partnershipTitle}
            </h2>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 items-stretch">
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
                  {t.partnershipIntro}
                </p>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(15px, 1.2vw, 18px)",
                  }}
                  className="text-[#3D1A00]/90"
                >
                  {t.partnersGet}
                </p>
                <ul className="space-y-1.5">
                  {t.partnersItems.map((item, i) => (
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
                  <LocaleLink
                    href="/partnership"
                    className="inline-flex items-center justify-center w-full px-8 py-3.5 bg-white border border-[#3D1A00]/20 text-[#3D1A00] uppercase font-['Montserrat'] font-semibold tracking-widest hover:border-[#3D1A00]/40 hover:bg-[#3D1A00]/5 transition-colors text-sm"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    {t.moreDetails}
                  </LocaleLink>
                </div>
              </div>

              <div className="w-full lg:w-1/2 min-w-0 mt-10 lg:mt-0 lg:pl-5">
                <div className="relative w-full aspect-[16/10] min-h-[200px] lg:min-h-[280px] rounded-lg overflow-hidden bg-[#D9D9D9]">
                  <Image
                    src="/images/choice-features/hf_20260307_174928_45490834-1da6-4ee5-b317-cc4fa3a4fcc1.png"
                    alt={t.partnershipImageAlt}
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

      <section id="faq" className={`w-full max-w-[1920px] mx-auto ${scrollClass}`}>
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="flex flex-col lg:flex-row max-w-6xl mx-auto items-stretch gap-10 lg:gap-0 font-['Montserrat'] text-[#3D1A00]">
            <div className="w-full lg:w-1/2 min-w-0 order-2 lg:order-1 lg:pr-5">
              {t.faqItems.map((item, index) => {
                const isOpen = openFaq === index + 1;
                return (
                  <div key={index} className="border-b border-[#3D1A00]/10 last:border-b-0">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index + 1)}
                      className="w-full flex items-center justify-between py-6 lg:py-8 gap-4 text-left group"
                    >
                      <div className="flex items-center gap-6 lg:gap-8 min-w-0">
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

            <div className="w-full lg:w-1/2 min-w-0 order-1 lg:order-2 lg:pl-5 flex flex-col justify-center text-left lg:text-right">
              <h2 className="text-[#3D1A00] uppercase leading-[159%] tracking-[-0.02em] mb-4 font-['Montserrat'] font-medium text-3xl sm:text-4xl lg:text-[64px]">
                {t.faqTitle}
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
                {t.faqSubtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="delivery" className="w-full max-w-[1920px] mx-auto">
        <div className="py-16 lg:py-20 px-3 lg:px-8 border-b border-[#3D1A00]/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[#3D1A00] uppercase leading-[159%] tracking-[-0.02em] mb-16 lg:mb-20 font-['Montserrat'] font-medium text-3xl sm:text-4xl lg:text-[64px]">
              {t.deliveryPaymentTitle}
            </h2>

            <div className="space-y-20 lg:space-y-28">
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
                    {t.paymentHeading}
                  </h3>
                </div>
                <div className="flex-1 space-y-10">
                  {t.paymentMethods.map((p) => (
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
                    {t.deliveryHeading}
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
                    {t.deliveryNote}
                  </p>
                </div>
                <div className="flex-1 space-y-10">
                  {t.deliveryMethods.map((p) => (
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
