"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LocaleLink from "@/components/i18n/LocaleLink";
import ImageLightbox from "@/components/shared/ImageLightbox";
import { siteContact } from "@/lib/siteContact";
import { SITE_WORDMARK } from "@/lib/siteBrand";

const DOC_IMAGES = [
  "/docs/dietitians-association-approved.png",
  "/docs/association-pediatricians.jpg",
  "/docs/vybir-ukrainy-2016.jpg",
  "/docs/zirka-yakosti-2015.jpg",
  "/docs/choice-docs-photo.jpg",
] as const;

const EXPERT_PHOTOS: Record<string, string> = {
  lapshin: "/experts/volodymyr-lapshin.png",
  potapenko: "/experts/serhiy-potapenko.png",
};

function BenefitIcon({ index }: { index: number }) {
  const common = {
    className: "h-9 w-9 md:h-10 md:w-10",
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
      // Взаємодія компонентів
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="2.75" />
          <circle cx="6" cy="12" r="2.75" />
          <circle cx="18" cy="19" r="2.75" />
          <path d="M8.6 13.5 15.4 17.5" />
          <path d="M15.4 6.5 8.6 10.5" />
        </svg>
      );
    case 1:
      // Природа + наука
      return (
        <svg {...common}>
          <path d="M5.5 19.5c3-1 5-3.25 5.5-6 .5-2.75 1.75-4.25 3.5-5.75" />
          <path d="M8.5 11c1-.75 1.75-1.5 2.25-2.5" />
          <path d="M15 5.25h3.5" />
          <path d="M16.75 5.25V8" />
          <path d="M14 8.5h5.5l-1.75 6.75a.75.75 0 0 1-.73.58h-1.29a.75.75 0 0 1-.73-.58L14 8.5Z" />
        </svg>
      );
    case 2:
      // Біодоступність
      return (
        <svg {...common}>
          <path d="M12 2.75c-2 3.25-4 5.25-4 7.75a4 4 0 0 0 8 0c0-2.5-2-4.5-4-7.75Z" />
          <path d="M12 14.5v2.75" />
          <path d="m10.25 16.25 1.75 1.75 1.75-1.75" />
          <path d="M7.75 20.25h8.5" />
        </svg>
      );
    case 3:
      // Комплекс поживних речовин
      return (
        <svg {...common}>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
          <path d="m3 12 9 4.5 9-4.5" />
          <path d="m3 16.5 9 4.5 9-4.5" />
        </svg>
      );
    case 4:
      // Традиційні інгредієнти
      return (
        <svg {...common}>
          <path d="M4 20 14 10" />
          <path d="M16.5 7.5a7 7 0 1 1-9.9 0" />
          <path d="M12 3v1.5" />
          <path d="M12 18.5V20" />
          <path d="M7.5 5.5 8.6 6.6" />
          <path d="M16.5 5.5 15.4 6.6" />
          <path d="M5.5 12H7" />
          <path d="M17 12h1.5" />
          <path d="M7.5 18.5 8.6 17.4" />
          <path d="M16.5 18.5 15.4 17.4" />
        </svg>
      );
    default:
      // Оздоровлення
      return (
        <svg {...common}>
          <path d="M19.25 13.75c1.12-1.1 2.25-2.45 2.25-4.25a4.75 4.75 0 0 0-9.5 0c0 1.8 1.13 3.15 2.25 4.25L12 20.5l-1.75-6.75Z" />
          <path d="M3.5 12.25H8l.75-1.5 1.75 4 1.75-3 1 2.25h5.25" />
        </svg>
      );
  }
}

function SectionIcon({ variant }: { variant: "docs" | "building" | "people" }) {
  const common = {
    className: "h-7 w-7 md:h-8 md:w-8",
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  if (variant === "docs") {
    return (
      <svg {...common}>
        <path d="M7 3.75h7.25L19 8.5v11.75A1.75 1.75 0 0117.25 22H7A1.75 1.75 0 015.25 20.25V5.5A1.75 1.75 0 017 3.75z" />
        <path d="M14.25 3.75V8.5H19" />
        <path d="M8.5 13h7M8.5 16.5h5" />
      </svg>
    );
  }
  if (variant === "building") {
    return (
      <svg {...common}>
        <path d="M4.5 20.5h15" />
        <path d="M6 20.5V9.75L12 5.5l6 4.25V20.5" />
        <path d="M9.25 20.5v-4.75h5.5V20.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="2.5" />
      <path d="M3.75 18.75c.7-2.6 2.7-4 5.25-4s4.55 1.4 5.25 4" />
      <circle cx="16.25" cy="9" r="2" />
      <path d="M14.5 14.5c1.6-.45 3.4.2 4.35 1.85" />
    </svg>
  );
}

function ProofIntro({
  number,
  icon,
  title,
  text,
  tags,
}: {
  number: string;
  icon: "docs" | "building" | "people";
  title: string;
  text: string;
  tags: string;
}) {
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3.5 md:gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center text-[#3D1A00] md:h-14 md:w-14">
          <SectionIcon variant={icon} />
        </span>
        <span className="font-['Montserrat'] text-base font-semibold tracking-[0.14em] text-[#8B9A47] md:text-lg">
          {number}
        </span>
      </div>
      <h3 className="mt-6 font-['Montserrat'] text-[1.65rem] font-bold leading-tight text-[#3D1A00] sm:text-3xl md:text-[2rem]">
        {title}
      </h3>
      <p className="mt-4 font-['Montserrat'] text-base leading-relaxed text-[#3D1A00]/75 md:text-lg md:leading-[1.6]">
        {text}
      </p>
      <p className="mt-7 inline-flex rounded-full bg-[#D7D799] px-5 py-2.5 font-['Montserrat'] text-xs font-semibold uppercase tracking-[0.08em] text-[#3D1A00] sm:text-sm">
        {tags}
      </p>
    </div>
  );
}

function DocsCollage({
  badge,
  onOpen,
}: {
  badge: string;
  onOpen: (src: string) => void;
}) {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-xl sm:h-[400px] lg:h-[440px]">
      {/* Center hero card */}
      <button
        type="button"
        onClick={() => onOpen(DOC_IMAGES[0])}
        className="absolute left-[18%] top-[4%] z-[3] h-[78%] w-[42%] overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(61,26,0,0.14)] ring-1 ring-[#3D1A00]/10 transition hover:-translate-y-0.5"
        aria-label={badge}
      >
        <Image
          src={DOC_IMAGES[0]}
          alt=""
          fill
          className="object-cover"
          sizes="220px"
        />
      </button>

      {/* Left framed doc */}
      <button
        type="button"
        onClick={() => onOpen(DOC_IMAGES[1])}
        className="absolute left-0 top-[18%] z-[2] h-[52%] w-[34%] rotate-[-6deg] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_rgba(61,26,0,0.12)] ring-1 ring-[#3D1A00]/10 transition hover:rotate-[-4deg]"
      >
        <span className="relative block h-full w-full overflow-hidden rounded-xl bg-[#f3efe6]">
          <Image
            src={DOC_IMAGES[1]}
            alt=""
            fill
            className="object-cover"
            sizes="160px"
          />
        </span>
      </button>

      {/* Top-right award */}
      <button
        type="button"
        onClick={() => onOpen(DOC_IMAGES[2])}
        className="absolute right-[2%] top-[8%] z-[4] h-[34%] w-[40%] rotate-[5deg] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_rgba(61,26,0,0.14)] ring-1 ring-[#3D1A00]/10 transition hover:rotate-[3deg]"
      >
        <span className="relative block h-full w-full overflow-hidden rounded-xl">
          <Image
            src={DOC_IMAGES[2]}
            alt=""
            fill
            className="object-contain bg-white p-1"
            sizes="180px"
          />
        </span>
      </button>

      {/* Bottom-right star award */}
      <button
        type="button"
        onClick={() => onOpen(DOC_IMAGES[3])}
        className="absolute bottom-[10%] right-[8%] z-[5] h-[36%] w-[32%] rotate-[-4deg] overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_10px_28px_rgba(61,26,0,0.14)] ring-1 ring-[#3D1A00]/10 transition hover:rotate-[-2deg]"
      >
        <span className="relative block h-full w-full overflow-hidden rounded-xl">
          <Image
            src={DOC_IMAGES[3]}
            alt=""
            fill
            className="object-contain bg-white p-1"
            sizes="150px"
          />
        </span>
      </button>

      {/* Extra small photo peek */}
      <button
        type="button"
        onClick={() => onOpen(DOC_IMAGES[4])}
        className="absolute bottom-[6%] left-[28%] z-[1] h-[28%] w-[24%] rotate-[3deg] overflow-hidden rounded-2xl bg-white shadow-[0_8px_20px_rgba(61,26,0,0.1)] ring-1 ring-[#3D1A00]/8"
      >
        <span className="relative block h-full w-full">
          <Image
            src={DOC_IMAGES[4]}
            alt=""
            fill
            className="object-cover"
            sizes="120px"
          />
        </span>
      </button>

      <p className="absolute bottom-0 left-1/2 z-[6] -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 font-['Montserrat'] text-xs font-medium text-[#3D1A00]/75 shadow-sm ring-1 ring-[#3D1A00]/10 sm:text-sm">
        {badge}
      </p>
    </div>
  );
}

export default function WhyForBodySection() {
  const { dict } = useLocale();
  const t = dict.home.whyForBody;
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openDoc = (src: string) => {
    const idx = DOC_IMAGES.indexOf(src as (typeof DOC_IMAGES)[number]);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxSrc(src);
  };

  return (
    <section
      className="relative w-full overflow-hidden border-y border-[#3D1A00]/10 bg-[#FFF9F0]"
      aria-labelledby="why-forbody-heading"
    >
      <div className="relative mx-auto max-w-[1920px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <h2
            id="why-forbody-heading"
            className="font-['Montserrat'] text-3xl font-bold uppercase tracking-tight text-[#3D1A00] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]"
          >
            {t.title.replace("{brand}", SITE_WORDMARK)}
          </h2>
          <p className="mt-4 max-w-2xl font-['Montserrat'] text-base leading-relaxed text-[#3D1A00]/75 md:text-lg">
            {t.lead}
          </p>
        </div>

        {/* 01 Documents */}
        <div className="mt-14 grid grid-cols-1 items-center gap-10 border-t border-[#3D1A00]/10 pt-12 lg:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-16">
          <ProofIntro
            number={t.docs.number}
            icon="docs"
            title={t.docs.title}
            text={t.docs.text}
            tags={t.docs.tags}
          />
          <DocsCollage badge={t.docs.badge} onOpen={openDoc} />
        </div>

        {/* 02 Institutions */}
        <div className="mt-16 grid grid-cols-1 items-start gap-10 border-t border-[#3D1A00]/10 pt-12 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-16">
          <ProofIntro
            number={t.institutions.number}
            icon="building"
            title={t.institutions.title}
            text={t.institutions.text}
            tags={t.institutions.tags}
          />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {t.institutions.items.map((name) => (
              <li
                key={name}
                className="rounded-2xl border border-[#3D1A00]/10 bg-white/80 px-5 py-5 font-['Montserrat'] text-base leading-snug text-[#3D1A00] shadow-[0_4px_18px_rgba(61,26,0,0.04)] sm:text-lg"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* 03 Experts */}
        <div className="mt-16 grid grid-cols-1 items-start gap-10 border-t border-[#3D1A00]/10 pt-12 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pt-16">
          <ProofIntro
            number={t.experts.number}
            icon="people"
            title={t.experts.title}
            text={t.experts.text}
            tags={t.experts.tags}
          />
          <ul className="space-y-4">
            {t.experts.people.map((person) => {
              const initials = person.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join("");
              const photo = EXPERT_PHOTOS[person.id];
              return (
                <li
                  key={person.id}
                  className="flex gap-4 rounded-2xl border border-[#3D1A00]/10 bg-white/80 p-5 shadow-[0_4px_18px_rgba(61,26,0,0.04)] sm:gap-5 sm:p-6"
                >
                  {photo ? (
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full sm:h-16 sm:w-16">
                      <Image
                        src={photo}
                        alt={person.name}
                        fill
                        className="object-cover object-top"
                        sizes="64px"
                      />
                    </span>
                  ) : (
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#D7D799] font-['Montserrat'] text-base font-bold text-[#3D1A00] sm:h-16 sm:w-16"
                      aria-hidden
                    >
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-['Montserrat'] text-lg font-semibold text-[#3D1A00] sm:text-xl">
                      {person.name}
                    </p>
                    <p className="mt-1.5 font-['Montserrat'] text-base leading-relaxed text-[#3D1A00]/70">
                      {person.role}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Benefits */}
        <div className="mt-16 border-t border-[#3D1A00]/10 pt-12 lg:mt-20 lg:pt-16">
          <ul className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
            {t.benefits.map((item, i) => (
              <li key={item} className="flex items-start gap-4 md:gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center text-[#3D1A00] md:h-12 md:w-12">
                  <BenefitIcon index={i} />
                </span>
                <p className="pt-1 font-['Montserrat'] text-base leading-snug text-[#3D1A00] md:text-lg md:leading-snug">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-[#3D1A00]/12 pt-10 sm:mt-16 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-12">
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

      <ImageLightbox
        images={lightboxSrc ? [...DOC_IMAGES] : null}
        startIndex={lightboxIndex}
        onClose={() => setLightboxSrc(null)}
      />
    </section>
  );
}
