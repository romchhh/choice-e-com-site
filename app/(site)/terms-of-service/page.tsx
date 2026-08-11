import type { Metadata } from "next";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/getLocale";
import { getTermsCopy } from "@/lib/i18n/content/terms";
import { buildPageMetadata, getBaseUrl } from "@/lib/i18n/content/pageMeta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getTermsCopy(locale);
  return buildPageMetadata(locale, "/terms-of-service", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogDescription: t.ogDescription,
    twitterDescription: t.twitterDescription,
    imageAlt: t.imageAlt,
  });
}

export default async function TermsOfServicePage() {
  const locale = await getLocale();
  const t = getTermsCopy(locale);
  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-16">
          <LocaleLink
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            {t.backHome}
          </LocaleLink>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">{t.title}</h1>
          <div className="w-20 h-1 bg-black mt-6"></div>
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            {t.intro.map((p, i) => (
              <p key={i} className={i === 0 ? "text-lg opacity-80" : "opacity-80"}>
                {p}
              </p>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.defsTitle}</h2>
            <div className="space-y-4">
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">{t.siteTerm}</p>
                <p className="text-sm opacity-70">
                  {t.siteDefBefore}
                  <a href={baseUrl} className="underline break-all">
                    {baseUrl}
                  </a>
                  {t.siteDefAfter}
                </p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">{t.productTerm}</p>
                <p className="text-sm opacity-70">{t.productDef}</p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">{t.offerTerm}</p>
                <p className="text-sm opacity-70">{t.offerDef}</p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">{t.buyerTerm}</p>
                <p className="text-sm opacity-70">{t.buyerDef}</p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">{t.orderTerm}</p>
                <p className="text-sm opacity-70">{t.orderDef}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s1Title}</h2>
            <ul className="space-y-3">
              {t.s1Items.map((item) => (
                <li key={item.slice(0, 40)} className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-1">•</span>
                  <span className="opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s2Title}</h2>
            <ul className="space-y-3">
              {t.s2Items.map((item) => (
                <li key={item.slice(0, 40)} className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-1">•</span>
                  <span className="opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s3Title}</h2>
            <div className="space-y-3">
              {t.s3Paras.map((p) => (
                <p key={p.slice(0, 40)} className="opacity-80">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s4Title}</h2>
            <ul className="space-y-3">
              {t.s4Items.map((item) => (
                <li key={item.slice(0, 40)} className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-1">•</span>
                  <span className="opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s5Title}</h2>
            <ul className="space-y-3">
              {t.s5Items.map((item) => (
                <li key={item.slice(0, 40)} className="flex items-start gap-3">
                  <span className="text-2xl leading-none mt-1">•</span>
                  <span className="opacity-80">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s6Title}</h2>
            <div className="p-5 border border-black/10 rounded-lg space-y-3">
              <p className="opacity-80">{t.s6P1}</p>
              <p className="opacity-80">{t.s6P2}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s7Title}</h2>
            <div>
              <p className="font-semibold mb-3">{t.sellerRightsTitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.sellerRights.map((right, i) => (
                  <div
                    key={right}
                    className={`p-4 border-l-2 border-black/20${i === 2 ? " md:col-span-2" : ""}`}
                  >
                    <p className="text-sm opacity-70">{right}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s8Title}</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">{t.buyerRightsTitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {t.buyerRights.map((right) => (
                    <div key={right} className="p-4 border-l-2 border-black/20">
                      <p className="text-sm opacity-70">{right}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold mb-3">{t.buyerDutiesTitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {t.buyerDuties.map((duty) => (
                    <div key={duty} className="p-4 border-l-2 border-black/20">
                      <p className="text-sm opacity-70">{duty}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s9Title}</h2>
            <div className="p-5 border-l-4 border-black/30">
              <p className="opacity-80">{t.s9Text}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s10Title}</h2>
            <div className="bg-black/5 p-8 rounded-2xl border border-black/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqRecipient}</p>
                  <p className="text-sm opacity-90">{t.reqRecipientValue}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqTaxId}</p>
                  <p className="text-sm opacity-90">{t.reqTaxIdValue}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqIban}</p>
                  <p className="text-sm opacity-90">{t.reqIbanValue}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqBank}</p>
                  <p className="text-sm opacity-90">{t.reqBankValue}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqMfo}</p>
                  <p className="text-sm opacity-90">{t.reqMfoValue}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">{t.reqBankEdrpou}</p>
                  <p className="text-sm opacity-90">{t.reqBankEdrpouValue}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">{t.updated}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
