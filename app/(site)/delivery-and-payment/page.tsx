import type { Metadata } from "next";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDeliveryCopy } from "@/lib/i18n/content/delivery";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDeliveryCopy(locale);
  return buildPageMetadata(locale, "/delivery-and-payment", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogDescription: t.ogDescription,
    twitterDescription: t.twitterDescription,
    imageAlt: t.imageAlt,
  });
}

export default async function DeliveryAndPaymentPage() {
  const locale = await getLocale();
  const t = getDeliveryCopy(locale);

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

        <div className="space-y-14 text-base leading-relaxed">
          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.paymentTitle}</h2>
            <p className="opacity-90">{t.paymentIntro}</p>
            <ul className="space-y-3 opacity-90 list-disc pl-5 marker:text-black">
              {t.paymentItems.map((item) => (
                <li key={item.strong}>
                  <strong>{item.strong}</strong>
                  {item.rest}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.feesTitle}</h2>
            <p className="opacity-90">
              {t.feesCod}
              <strong>{t.feesCodValue}</strong>.
            </p>
            <p className="opacity-90">{t.feesDeclared}</p>
            <ul className="space-y-2 opacity-90 list-disc pl-5">
              {t.feesDeclaredItems.map((item) => (
                <li key={item.strong}>
                  {item.before}
                  <strong>{item.strong}</strong>
                  {item.after}
                </li>
              ))}
            </ul>
            <p className="opacity-80 text-sm">
              {t.feesNote}
              <strong>{t.feesNoteDate}</strong>.
            </p>
            <p className="opacity-90">
              {t.feesLinkIntro}
              <a
                href="https://novaposhta.ua/shipping-cost"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3D1A00] underline font-medium hover:opacity-80"
              >
                novaposhta.ua/shipping-cost
              </a>
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.deliveryTitle}</h2>
            <p className="opacity-90 font-medium">{t.deliveryCostIntro}</p>
            <ul className="space-y-2 opacity-90 list-disc pl-5">
              {t.deliveryCostItems.map((item) => (
                <li key={item.strong}>
                  <strong>{item.strong}</strong>
                  {item.rest}
                  {item.strong2 ? <strong>{item.strong2}</strong> : null}
                  {item.rest2 ?? null}
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-2">
              <h3 className="text-xl font-semibold">{t.methodsTitle}</h3>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                <li>
                  {t.methodBranchBefore}
                  <strong>{t.methodBranchStrong1}</strong>
                  {t.methodBranchMid}
                  <strong>{t.methodBranchStrong2}</strong>
                  {t.methodBranchAfter}
                </li>
                <li>
                  <strong>{t.methodCourierStrong}</strong>
                  {t.methodCourierRest}
                </li>
                <li>
                  {t.methodUkrposhtaBefore}
                  <strong>{t.methodUkrposhtaStrong}</strong>
                  {t.methodUkrposhtaAfter}
                </li>
              </ul>
              <p className="opacity-80 text-sm pl-1 border-l-2 border-[#3D1A00]/20 pl-4">
                {t.courierNote}
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">{t.timingTitle}</h2>

            <div className="space-y-3 rounded-lg border border-black/10 p-5 bg-black/[0.02]">
              <h3 className="text-xl font-semibold">{t.npTitle}</h3>
              <p className="text-sm opacity-70 mb-2">
                {t.npIntro}
                <a
                  href="https://novaposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#3D1A00] hover:opacity-80"
                >
                  novaposhta.ua
                </a>
                :
              </p>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                {t.npItems.map((item) => (
                  <li key={item.strong}>
                    {item.before}
                    <strong>{item.strong}</strong>
                    {item.after}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-lg border border-black/10 p-5 bg-black/[0.02]">
              <h3 className="text-xl font-semibold">{t.upTitle}</h3>
              <ul className="space-y-2 opacity-90 list-disc pl-5">
                <li>
                  <strong>{t.upItemStrong}</strong>
                  {t.upItemRest}
                </li>
              </ul>
            </div>

            <p className="opacity-90">
              {t.carriersBefore}
              <strong>{t.carriersNp}</strong>
              {t.carriersOr}
              <strong>{t.carriersUp}</strong>
              {t.carriersAfter}
            </p>
            <p className="opacity-90">
              {t.storageBefore}
              <strong>{t.storageStrong}</strong>
              {t.storageAfter}
            </p>
            <p className="opacity-90">{t.scheduleIntro}</p>
            <ul className="space-y-2 opacity-90 list-none pl-0">
              <li>
                👉{" "}
                <a
                  href="https://novaposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3D1A00] underline font-medium hover:opacity-80"
                >
                  {t.scheduleNp}
                </a>
              </li>
              <li>
                👉{" "}
                <a
                  href="https://ukrposhta.ua/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3D1A00] underline font-medium hover:opacity-80"
                >
                  {t.scheduleUp}
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-4 pt-4 border-t border-black/10">
            <h2 className="text-xl font-semibold">{t.extraTitle}</h2>
            <p className="opacity-80">{t.extraPickup}</p>
            <p className="opacity-80">
              {t.extraUnder2000Before}
              <strong>{t.extraUnder2000Strong}</strong>
              {t.extraUnder2000After}
            </p>
            <p className="opacity-80">
              {t.extraFreeNoteBefore}
              <strong>{t.extraFreeNoteStrong}</strong>
              {t.extraFreeNoteAfter}
            </p>
          </section>

          <section className="pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">{t.footerNote}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
