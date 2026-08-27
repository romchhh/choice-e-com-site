"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import OfficialRepBadge from "@/components/layout/OfficialRepBadge";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LocaleLink from "@/components/i18n/LocaleLink";
import { stripLocalePrefix } from "@/lib/i18n/paths";
import type { LocalizedHeroSlide } from "@/lib/heroBanners";
import { resolveHeroCtaColor } from "@/lib/heroBanners";

const FALLBACK_IMAGE = "/images/hero.jpg";
const MAIN_HERO_SLIDE_ID = 0;
const ROTATE_MS = 7000;

type Props = {
  slides?: LocalizedHeroSlide[];
};

export default function Hero({ slides = [] }: Props) {
  const { dict } = useLocale();
  const pathname = usePathname();
  const isHomePage = stripLocalePrefix(pathname || "/") === "/";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const mainSlide = useMemo<LocalizedHeroSlide>(
    () => ({
      id: MAIN_HERO_SLIDE_ID,
      badge: null,
      title: dict.hero.headline,
      subtitle: dict.hero.subhead,
      benefitText: null,
      priceLabel: null,
      ctaLabel: dict.hero.ctaCatalog,
      href: "/catalog",
      secondaryCtaLabel: null,
      secondaryHref: null,
      imageUrl: FALLBACK_IMAGE,
      imageUrlMobile: FALLBACK_IMAGE,
      ctaColor: null,
    }),
    [dict]
  );

  const allSlides = useMemo(
    () => [mainSlide, ...slides],
    [mainSlide, slides]
  );

  const safeIndex = index % allSlides.length;
  const current = allSlides[safeIndex];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % allSlides.length) + allSlides.length) % allSlides.length);
    },
    [allSlides.length]
  );

  useEffect(() => {
    if (allSlides.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % allSlides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [allSlides.length, paused]);

  return (
    <>
      <section
        id="hero"
        className={`relative max-lg:min-h-[100dvh] ${isHomePage ? "max-lg:-mt-[var(--site-header-offset)]" : ""}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="max-w-[1920px] mx-auto w-full relative overflow-hidden flex flex-col max-lg:min-h-[100dvh] sm:min-h-[calc(100dvh-var(--site-header-offset))]">
          <div className="relative flex-1 max-lg:min-h-[100dvh] sm:min-h-[70vh]">
          {/* Crossfade layers when multiple slides */}
          {allSlides.map((slide, i) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  i === safeIndex ? "opacity-100 z-[1]" : "opacity-0 z-0"
                }`}
                aria-hidden={i !== safeIndex}
              >
                <Image
                  src={slide.imageUrlMobile || slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="object-cover object-center sm:hidden"
                  priority={i === 0}
                  sizes="100vw"
                />
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  className="hidden sm:block object-cover object-right"
                  priority={i === 0}
                  sizes="100vw"
                />
              </div>
            ))}

          <div
            className="absolute inset-0 bg-black/25 pointer-events-none z-[2]"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none z-[2]"
            aria-hidden
          />

          {/* Official rep — minimalist, lower on the photo */}
          <div className="absolute right-4 z-20 bottom-20 sm:right-8 sm:bottom-40 md:right-12 lg:right-16 lg:bottom-44">
            <OfficialRepBadge />
          </div>

          <div
            className={`absolute inset-0 z-10 flex items-center px-6 sm:px-10 md:px-16 lg:px-20 py-10 pb-16 sm:py-12 sm:pb-32 lg:pb-36 ${
              isHomePage ? "max-lg:pt-[var(--site-header-offset)]" : ""
            }`}
          >
            <div className="flex w-full max-w-2xl flex-col items-start gap-6 md:gap-8">
              <PromoSlideContent slide={current} />
            </div>
          </div>

          {allSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(safeIndex - 1)}
                aria-label={dict.hero.prevSlide}
                className="absolute bottom-16 left-2 z-30 cursor-pointer rounded-full opacity-80 transition hover:opacity-100 sm:bottom-auto sm:left-5 sm:top-[42%] sm:-translate-y-1/2 md:left-8"
              >
                <Image
                  src="/images/light-theme/slider-button-left.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1)}
                aria-label={dict.hero.nextSlide}
                className="absolute bottom-16 right-2 z-30 cursor-pointer rounded-full opacity-80 transition hover:opacity-100 sm:bottom-auto sm:right-5 sm:top-[42%] sm:-translate-y-1/2 md:right-8"
              >
                <Image
                  src="/images/light-theme/slider-button-right.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 sm:h-12 sm:w-12"
                  aria-hidden
                />
              </button>
            </>
          )}

          {allSlides.length > 1 && (
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-36 lg:bottom-40">
              {allSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={dict.hero.slideLabel.replace("{n}", String(i + 1))}
                  aria-current={i === safeIndex}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === safeIndex
                      ? "w-8 bg-[#D7D799]"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}

          <HeroBenefitsDesktop benefits={dict.hero.benefits} />
        </div>
      </div>
    </section>

      <HeroBenefitsMobile benefits={dict.hero.benefits} />
    </>
  );
}

type HeroBenefit = { title: string; text: string };

function HeroBenefitIcon({
  index,
  className = "h-7 w-7",
}: {
  index: number;
  className?: string;
}) {
  const common = {
    className,
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
      // Оплата при отриманні — гаманець
      return (
        <svg {...common}>
          <path d="M3.5 8.5h15.25A1.75 1.75 0 0120.5 10.25v8A1.75 1.75 0 0118.75 20H5.25A1.75 1.75 0 013.5 18.25v-8.5A1.25 1.25 0 014.75 7.5h12" />
          <path d="M3.5 8.5V6.75A1.75 1.75 0 015.25 5h11.5" />
          <circle cx="16.25" cy="14.25" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case 1:
      // Швидка доставка — вантажівка
      return (
        <svg {...common}>
          <path d="M3 7.5h9.5v9H3.75A.75.75 0 013 15.75V7.5z" />
          <path d="M12.5 10.5H17l2.5 3v3.25a.75.75 0 01-.75.75H12.5v-7z" />
          <path d="M12.5 10.5V7.5" />
          <circle cx="7" cy="17.5" r="1.75" />
          <circle cx="17" cy="17.5" r="1.75" />
          <path d="M8.75 17.5h6.5" />
        </svg>
      );
    case 2:
      // Гарантія якості — щит з галочкою
      return (
        <svg {...common}>
          <path d="M12 3.25l7.25 2.5v5.4c0 4.55-3.05 7.85-7.25 9.35-4.2-1.5-7.25-4.8-7.25-9.35v-5.4L12 3.25z" />
          <path d="M9.25 12.1l1.9 1.9 3.7-3.9" />
        </svg>
      );
    case 3:
      // Купівля в 1 клік — курсор / клік
      return (
        <svg {...common}>
          <path d="M9.2 4.2l1.35 12.35a.75.75 0 001.3.4l2.35-2.85 2.55 4.4a.9.9 0 001.55-.9l-2.55-4.4 3.7-.55a.75.75 0 00.35-1.3L9.95 3.55a.75.75 0 00-.75.65z" />
        </svg>
      );
    default:
      // Підбір курсу — експерт / консультація
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.25" />
          <path d="M5.5 19.25c.9-3.1 3.35-4.75 6.5-4.75s5.6 1.65 6.5 4.75" />
          <path d="M17.75 8.5c1.45.35 2.5 1.65 2.5 3.2 0 1.2-.65 2.25-1.6 2.8" />
        </svg>
      );
  }
}

function HeroBenefitsMobile({ benefits }: { benefits: HeroBenefit[] }) {
  const trackItems = useMemo(
    () => [...benefits, ...benefits],
    [benefits]
  );

  return (
    <section
      className="overflow-hidden border-t border-neutral-100 bg-white py-3.5 sm:hidden"
      aria-label="Переваги"
    >
      <div className="hero-benefits-marquee flex w-max items-stretch gap-2.5">
        {trackItems.map((b, i) => (
          <div
            key={`${b.title}-${i}`}
            className="flex w-[13rem] shrink-0 flex-col gap-1.5 rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 shadow-[0_1px_8px_rgba(61,26,0,0.06)]"
            aria-hidden={i >= benefits.length}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 text-[#8B9A47]">
                <HeroBenefitIcon
                  index={i % benefits.length}
                  className="h-6 w-6"
                />
              </span>
              <span className="font-['Montserrat'] text-[10px] font-semibold uppercase leading-tight tracking-[0.04em] text-[#3D1A00]">
                {b.title}
              </span>
            </div>
            <p className="pl-8 font-['Montserrat'] text-[10px] leading-snug text-[#3D1A00]/70">
              {b.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HeroBenefitsDesktop({ benefits }: { benefits: HeroBenefit[] }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 hidden sm:block">
      <div className="border-t border-white/10 bg-black/40 backdrop-blur-md">
        <ul className="mx-auto grid max-w-[1920px] sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-white/15">
          {benefits.map((b, i) => (
            <li
              key={b.title}
              className="flex items-start gap-3 px-4 py-4 md:gap-3.5 md:px-5 md:py-5"
            >
              <span className="mt-0.5 shrink-0 text-[#D7D799]">
                <HeroBenefitIcon index={i} className="h-8 w-8 md:h-9 md:w-9" />
              </span>
              <div className="min-w-0">
                <p className="font-['Montserrat'] text-xs font-semibold uppercase tracking-[0.05em] text-white md:text-sm">
                  {b.title}
                </p>
                <p className="mt-0.5 font-['Montserrat'] text-[11px] leading-snug text-white/75 md:text-xs">
                  {b.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function heroCtaStyle(colorId: string | null | undefined): CSSProperties {
  const c = resolveHeroCtaColor(colorId);
  return {
    ["--cta-bg" as string]: c.bg,
    ["--cta-hover" as string]: c.hover,
    ["--cta-text" as string]: c.text,
    ["--cta-shadow" as string]: c.shadow,
  };
}

function PromoSlideContent({ slide }: { slide: LocalizedHeroSlide }) {
  const isMainSlide = slide.id === MAIN_HERO_SLIDE_ID;
  const hasSecondary =
    !!slide.secondaryHref && !!slide.secondaryCtaLabel?.trim();

  const primaryClassName =
    "inline-flex h-12 w-full min-h-[3rem] items-center justify-center rounded-full bg-[#D7D799] px-7 text-sm font-semibold uppercase tracking-[0.06em] text-[#3D1A00] shadow-[0_4px_22px_rgba(215,215,153,0.4)] transition-all duration-300 hover:bg-[#cfd48a] hover:shadow-[0_6px_26px_rgba(215,215,153,0.5)] active:scale-[0.98] sm:h-14 sm:w-auto sm:min-w-[220px] sm:px-9 sm:text-base";

  const secondaryClassName =
    "inline-flex h-12 w-full min-h-[3rem] items-center justify-center rounded-full border-2 border-white/90 bg-white/10 px-7 text-sm font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-[0.98] sm:h-14 sm:w-auto sm:min-w-[220px] sm:px-9 sm:text-base";

  const promoPrimaryClassName =
    "hero-cta-btn inline-flex h-12 w-full min-h-[3rem] items-center justify-center rounded-full px-8 text-sm font-semibold uppercase tracking-wide transition-all duration-300 active:scale-[0.98] sm:h-14 sm:w-auto sm:min-w-[220px] sm:text-base md:text-lg";

  const promoCtaStyle = heroCtaStyle(slide.ctaColor);

  function renderCta(
    href: string,
    label: string,
    className: string,
    external?: boolean
  ) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {label}
        </a>
      );
    }
    return (
      <LocaleLink href={href} className={className}>
        {label}
      </LocaleLink>
    );
  }

  const isExternal =
    slide.href.startsWith("http://") || slide.href.startsWith("https://");

  return (
    <>
      <div
        className={`flex flex-col items-start ${isMainSlide ? "gap-4 md:gap-5" : "gap-3 md:gap-4"}`}
      >
        <h1
          className="text-left text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: isMainSlide
              ? "clamp(2.5rem, 10vw, 4.5rem)"
              : "clamp(36px, 6vw, 64px)",
            lineHeight: isMainSlide ? "1.1" : "1.15",
            letterSpacing: "-0.02em",
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            className={`text-left font-['Montserrat'] text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.3)] ${
              isMainSlide
                ? "max-w-2xl text-xl leading-[1.5] sm:text-2xl md:text-[1.75rem] md:leading-[1.45]"
                : "max-w-xl text-base leading-[1.55] sm:text-lg md:text-xl"
            }`}
          >
            {slide.subtitle}
          </p>
        )}
        {slide.priceLabel && (
          <span className="font-['Montserrat'] text-xl font-semibold text-white drop-shadow md:text-2xl">
            {slide.priceLabel}
          </span>
        )}
      </div>

      {hasSecondary ? (
        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
          {renderCta(
            slide.href,
            slide.ctaLabel,
            primaryClassName,
            isExternal
          )}
          {renderCta(
            slide.secondaryHref!,
            slide.secondaryCtaLabel!,
            secondaryClassName
          )}
        </div>
      ) : isMainSlide ? (
        renderCta(slide.href, slide.ctaLabel, primaryClassName, isExternal)
      ) : isExternal ? (
        <a
          href={slide.href}
          target="_blank"
          rel="noopener noreferrer"
          className={promoPrimaryClassName}
          style={promoCtaStyle}
        >
          {slide.ctaLabel}
        </a>
      ) : (
        <LocaleLink
          href={slide.href}
          className={promoPrimaryClassName}
          style={promoCtaStyle}
        >
          {slide.ctaLabel}
        </LocaleLink>
      )}
    </>
  );
}
