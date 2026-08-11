import type { Metadata } from "next";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/getLocale";
import { getReturnsCopy } from "@/lib/i18n/content/returns";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getReturnsCopy(locale);
  return buildPageMetadata(locale, "/returns-and-exchange", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogDescription: t.ogDescription,
    imageAlt: t.imageAlt,
  });
}

export default async function ReturnsAndExchangePage() {
  const locale = await getLocale();
  const t = getReturnsCopy(locale);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <LocaleLink
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            {t.backHome}
          </LocaleLink>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">{t.title}</h1>
          <div className="w-20 h-1 bg-black mt-6" />
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.exchangeTitle}</h2>
            <p className="opacity-80">{t.exchangeIntro}</p>
          </section>

          <section className="space-y-6 rounded-lg border border-black/10 p-6 md:p-8 bg-black/[0.02]">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.procedureTitle}</h2>
            <p className="opacity-90">{t.procedureIntro}</p>

            <div className="space-y-3 pt-2">
              <h3 className="text-xl font-semibold">{t.refundTermTitle}</h3>
              <p className="opacity-90">
                {t.refundTerm}
                <strong>{t.refundTermStrong}</strong>
                {t.refundTermEnd}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t.refundMethodTitle}</h3>
              <p className="opacity-90">{t.refundMethod}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{t.shippingCostTitle}</h3>
              <p className="opacity-90">
                {t.shippingBuyer}
                <strong>{t.shippingBuyerStrong}</strong>
                {t.shippingBuyerEnd}
              </p>
              <p className="opacity-90">
                {t.shippingSeller}
                <strong>{t.shippingSellerStrong}</strong>
                {t.shippingSellerEnd}
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.damageTitle}</h2>
            <p className="opacity-80">{t.damageIntro}</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.damageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="opacity-80">
              {t.writeUs}
              <a
                href="mailto:mari.choice26@gmail.com"
                className="font-semibold underline underline-offset-2 hover:opacity-100"
              >
                mari.choice26@gmail.com
              </a>
            </p>
            <p className="opacity-80">{t.addPhoto}</p>
            <p className="opacity-80">{t.afterCheck}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.qualityTitle}</h2>
            <p className="opacity-80">
              {t.qualityDaysBefore}
              <strong>{t.qualityDaysStrong}</strong>
              {t.qualityDaysAfter}
            </p>
            <p className="opacity-80 font-semibold">{t.conditionsLabel}</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.conditions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="opacity-80">{t.lawIntro}</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.lawRights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.limitsTitle}</h2>
            <p className="opacity-80">{t.limitsIntro}</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.limits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.legalTitle}</h2>
            <p className="opacity-80">{t.legalP1}</p>
            <p className="opacity-80">
              {t.legalP2Before}
              <strong>{t.legalP2Strong}</strong>
              {t.legalP2After}
            </p>
            <p className="opacity-80">{t.legalP3}</p>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.legalOptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="opacity-80">{t.legalNotify}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.checkTitle}</h2>
            <ul className="space-y-2 opacity-80 list-disc pl-5">
              {t.checkItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
