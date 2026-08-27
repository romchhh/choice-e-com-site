"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import LocaleLink from "@/components/i18n/LocaleLink";
import { siteContact } from "@/lib/siteContact";
import { SITE_WORDMARK } from "@/lib/siteBrand";

function PillarIcon({ index }: { index: number }) {
  const common = {
    className: "h-10 w-10 md:h-11 md:w-11",
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (index) {
    case 0:
      // Документи та сертифікати
      return (
        <svg {...common}>
          <path d="M7 3.75h7.25L19 8.5v11.75A1.75 1.75 0 0117.25 22H7A1.75 1.75 0 015.25 20.25V5.5A1.75 1.75 0 017 3.75z" />
          <path d="M14.25 3.75V8.5H19" />
          <path d="M8.5 13h7M8.5 16.5h5" />
          <path d="M8.5 9.75h2.5" />
        </svg>
      );
    case 1:
      // Нагороди бренду
      return (
        <svg {...common}>
          <path d="M8.5 4.5h7v4.25a3.5 3.5 0 01-7 0V4.5z" />
          <path d="M8.5 6H5.75A1.75 1.75 0 014 7.75v.5A3.25 3.25 0 007.25 11.5h.35" />
          <path d="M15.5 6h2.75A1.75 1.75 0 0120 7.75v.5a3.25 3.25 0 01-3.25 3.25h-.35" />
          <path d="M12 12v3.25" />
          <path d="M9.25 20.5h5.5L13.6 15.75h-3.2L9.25 20.5z" />
        </svg>
      );
    case 2:
      // Профільні інституції
      return (
        <svg {...common}>
          <path d="M4.5 20.5h15" />
          <path d="M6 20.5V9.75L12 5.5l6 4.25V20.5" />
          <path d="M9.25 20.5v-4.75h5.5V20.5" />
          <path d="M9.5 11.25h1.25M13.25 11.25H14.5M9.5 14.25h1.25M13.25 14.25H14.5" />
        </svg>
      );
    default:
      // Експерти бренду
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.75" />
          <path d="M3.75 18.75c.7-2.85 2.85-4.35 5.25-4.35s4.55 1.5 5.25 4.35" />
          <circle cx="16.5" cy="9" r="2.25" />
          <path d="M14.35 14.35c1.85-.55 3.85.15 4.9 2.15" />
        </svg>
      );
  }
}

export default function WhyForBodySection() {
  const { dict } = useLocale();
  const t = dict.home.whyForBody;

  return (
    <section
      className="relative w-full overflow-hidden border-y border-[#3D1A00]/10 bg-[#FFF9F0]"
      aria-labelledby="why-forbody-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(215,215,153,0.6), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(139,154,71,0.14), transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1920px] px-6 py-16 sm:py-20 lg:px-12 lg:py-28">
        <div className="max-w-4xl">
          <h2
            id="why-forbody-heading"
            className="font-['Montserrat'] text-3xl font-bold uppercase tracking-tight text-[#3D1A00] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            {t.title.replace("{brand}", SITE_WORDMARK)}
          </h2>
          <p className="mt-5 max-w-3xl font-['Montserrat'] text-base leading-relaxed text-[#3D1A00]/75 sm:text-lg md:mt-6 md:text-xl md:leading-[1.55]">
            {t.lead}
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-10 border-t border-[#3D1A00]/12 pt-12 sm:mt-16 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 sm:pt-14 lg:mt-20 lg:grid-cols-4 lg:gap-0 lg:pt-16">
          {t.pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className={
                index === 0
                  ? "lg:pr-8"
                  : "lg:border-l lg:border-[#3D1A00]/12 lg:px-8 last:lg:pr-0"
              }
            >
              <div className="flex items-center gap-3 md:gap-4">
                <span className="inline-flex shrink-0 text-[#3D1A00]">
                  <PillarIcon index={index} />
                </span>
                <span className="font-['Montserrat'] text-sm font-semibold uppercase tracking-[0.16em] text-[#8B9A47] md:text-base">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 font-['Montserrat'] text-xl font-semibold leading-snug text-[#3D1A00] md:text-2xl">
                {pillar.title}
              </h3>
              <p className="mt-3 font-['Montserrat'] text-[15px] leading-relaxed text-[#3D1A00]/70 md:mt-4 md:text-base md:leading-[1.65]">
                {pillar.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-col gap-6 border-t border-[#3D1A00]/12 pt-10 sm:mt-16 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-12 lg:mt-20">
          <div className="max-w-xl">
            <p className="font-['Montserrat'] text-xs font-semibold uppercase tracking-[0.12em] text-[#3D1A00]/55 md:text-sm">
              {t.contactLabel}
            </p>
            <a
              href={`mailto:${siteContact.email}`}
              className="mt-2 inline-block font-['Montserrat'] text-xl font-semibold text-[#3D1A00] underline decoration-[#3D1A00]/25 underline-offset-4 transition-opacity hover:opacity-80 md:text-2xl"
            >
              {siteContact.email}
            </a>
            <p className="mt-3 font-['Montserrat'] text-sm text-[#3D1A00]/65 md:text-base">
              {t.contactHint}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${siteContact.email}?subject=${encodeURIComponent(t.docsMailSubject)}`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#D7D799] px-7 font-['Montserrat'] text-sm font-semibold text-[#3D1A00] transition-opacity hover:opacity-90 sm:h-14 sm:px-8 sm:text-base"
            >
              {t.requestDocs}
            </a>
            <LocaleLink
              href="/info#about"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#3D1A00] px-7 font-['Montserrat'] text-sm font-semibold text-[#3D1A00] transition-colors hover:bg-[#3D1A00]/5 sm:h-14 sm:px-8 sm:text-base"
            >
              {t.moreAbout}
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
