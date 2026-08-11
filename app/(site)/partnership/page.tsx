import type { Metadata } from "next";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/getLocale";
import { getPartnershipCopy } from "@/lib/i18n/content/partnership";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

const collageImages = [
  "/images/partnership/0068.jpg",
  "/images/partnership/HL5A6060.jpg",
  "/images/partnership/HL5A6096.jpg",
  "/images/partnership/HL5A8688.jpg",
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getPartnershipCopy(locale);
  return buildPageMetadata(locale, "/partnership", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogDescription: t.ogDescription,
    twitterDescription: t.twitterDescription,
    ogType: "website",
    imagePath: "/images/partnership/0068.jpg",
    imageAlt: t.imageAlt,
  });
}

export default async function PartnershipPage() {
  const locale = await getLocale();
  const t = getPartnershipCopy(locale);
  const regUrl = locale === "ru" ? t.regUrlRu : t.regUrlUk;

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF]">
      <section className="w-full max-w-[1920px] mx-auto scroll-mt-[var(--site-header-offset)]">
        <div className="pt-4 lg:pt-6 pb-20 px-3 lg:px-8">
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-[#3D1A00]/60">
              <li>
                <LocaleLink href="/" className="hover:text-[#3D1A00] transition-colors">
                  {t.home}
                </LocaleLink>
              </li>
              <li aria-hidden>|</li>
              <li>
                <LocaleLink href="/info#partnership" className="hover:text-[#3D1A00] transition-colors">
                  {t.breadcrumbInfo}
                </LocaleLink>
              </li>
              <li aria-hidden>|</li>
              <li className="text-[#3D1A00]">{t.breadcrumbCurrent}</li>
            </ol>
          </nav>

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
            {t.title}
          </h1>

          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16 lg:mb-20 items-start">
            <div className="w-full lg:w-1/2 space-y-4 font-['Montserrat'] text-[#3D1A00]">
              {t.intro.map((p) => (
                <p key={p.slice(0, 48)} className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85">
                  {p}
                </p>
              ))}
            </div>

            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                {collageImages.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#D9D9D9]"
                  >
                    <Image
                      src={src}
                      alt={t.collageAlts[i]}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              {t.whyTitle}
            </h2>
            <p className="text-base sm:text-lg leading-[159%] text-[#3D1A00]/85 mb-4">{t.whyIntro}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {t.whyCards.map((card) => (
                <div key={card.title} className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-semibold uppercase tracking-[0.08em]">
                    {card.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/80">{card.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              {t.getTitle}
            </h2>
            <ul className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85">
              {t.getItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-[#3D1A00]/60 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-5xl mx-auto mb-16 lg:mb-20 font-['Montserrat'] text-[#3D1A00]">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium uppercase tracking-[-0.02em] leading-[150%] mb-6">
              {t.whoTitle}
            </h2>
            <p className="text-sm sm:text-base leading-[159%] text-[#3D1A00]/85 mb-4">{t.whoIntro}</p>
            <ul className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85">
              {t.whoItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="max-w-4xl mx-auto font-['Montserrat'] text-[#3D1A00]">
            <div className="bg-[#FFF9F0] border border-[#3D1A00]/10 rounded-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium uppercase tracking-[-0.02em] mb-4">
                {t.inviteTitle}
              </h2>
              <div className="space-y-3 text-sm sm:text-base leading-[159%] text-[#3D1A00]/85 mb-6">
                {t.inviteParas.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
              </div>

              <div className="flex flex-col items-stretch sm:items-start gap-4">
                <a
                  href={regUrl}
                  className="inline-flex w-full items-center justify-center px-8 py-3.5 rounded-full bg-[#3D1A00] text-white text-sm sm:text-base font-semibold uppercase tracking-[0.14em] hover:bg-[#3D1A00]/90 transition-colors text-center underline decoration-white/70 underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.cta}
                </a>

                <div className="mt-1 inline-flex flex-col gap-2 text-xs sm:text-sm leading-[159%] text-[#3D1A00]/80 bg-white/70 border border-[#3D1A00]/10 rounded-xl px-4 py-3 max-w-xl">
                  <p className="font-semibold text-[#3D1A00]">{t.afterRegTitle}</p>
                  <ul className="space-y-1">
                    {t.afterRegItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] sm:text-xs text-[#3D1A00]/60 mt-1">{t.afterRegNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
