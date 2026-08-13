import type { Metadata } from "next";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getPrivacyCopy } from "@/lib/i18n/content/privacy";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import type { Locale } from "@/lib/i18n/config";

export function buildPrivacyMetadata(locale: Locale): Metadata {
  const t = getPrivacyCopy(locale);
  return buildPageMetadata(locale, "/privacy-policy", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogDescription: t.ogDescription,
    twitterDescription: t.twitterDescription,
    imageAlt: t.imageAlt,
  });
}

export function generateMetadata(): Metadata {
  return buildPrivacyMetadata(LOCALE_UK);
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageContent locale={LOCALE_UK} />;
}

export function PrivacyPolicyPageContent({ locale }: { locale: Locale }) {
  const t = getPrivacyCopy(locale);

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
          <div className="w-20 h-1 bg-black dark:bg-white mt-6"></div>
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg opacity-80">{t.intro}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s1Title}</h2>
            <p className="opacity-70">{t.s1Intro}</p>
            <div className="space-y-5 mt-6">
              {t.terms.map((term) => (
                <div
                  key={term.title}
                  className="pl-6 border-l-2 border-black/10 dark:border-white/10"
                >
                  <p className="font-semibold mb-2">{term.title}</p>
                  <p className="opacity-70 text-sm">{term.text}</p>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              <p className="opacity-80">{t.s3P1}</p>
              <p className="opacity-80">{t.s3P2}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {t.s3Fields.map((field) => (
                  <div
                    key={field}
                    className="p-4 border border-black/10 dark:border-white/10 rounded-lg"
                  >
                    <p className="text-sm opacity-70">{field}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s4Title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.s4Goals.map((goal) => (
                <div key={goal} className="p-4 border-l-2 border-black/20 dark:border-white/20">
                  <p className="text-sm opacity-80">{goal}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s5Title}</h2>
            <div className="space-y-4">
              <p className="opacity-80">{t.s5P1}</p>
              <p className="opacity-80">{t.s5P2}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s6Title}</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">{t.userDutiesTitle}</p>
                <ul className="space-y-2 opacity-70">
                  {t.userDuties.map((duty) => (
                    <li key={duty} className="flex items-start gap-2">
                      <span>↪</span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">{t.adminDutiesTitle}</p>
                <ul className="space-y-2 opacity-70">
                  {t.adminDuties.map((duty) => (
                    <li key={duty} className="flex items-start gap-2">
                      <span>↪</span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">{t.s7Title}</h2>
            <div className="bg-black/5 dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 space-y-6">
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

          <section className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
            <p className="text-sm opacity-50">{t.updated}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
