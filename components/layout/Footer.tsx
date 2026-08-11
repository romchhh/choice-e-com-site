"use client";

import Image from "next/image";
import { siteContact } from "@/lib/siteContact";
import { SITE_WORDMARK } from "@/lib/siteBrand";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LocaleLink from "@/components/i18n/LocaleLink";

const PAYMENT_LOGOS = [
  {
    src: "/payments/Apple_Pay-Logo.wine.svg",
    alt: "Apple Pay",
    width: 88,
    height: 36,
    imageClassName:
      "h-10 sm:h-12 w-auto max-h-12 object-contain opacity-85 hover:opacity-100 transition-opacity",
  },
  {
    src: "/payments/Google_Pay_Logo.svg.webp",
    alt: "Google Pay",
    width: 52,
    height: 28,
    imageClassName:
      "h-7 sm:h-8 w-auto max-h-8 object-contain opacity-85 hover:opacity-100 transition-opacity",
  },
  {
    src: "/payments/Visa_Inc._logo_(2021–present).svg.png",
    alt: "Visa",
    width: 40,
    height: 13,
    imageClassName:
      "h-4 sm:h-5 w-auto max-h-5 object-contain opacity-85 hover:opacity-100 transition-opacity",
  },
  {
    src: "/payments/Mastercard-logo.png",
    alt: "Mastercard",
    width: 44,
    height: 28,
    imageClassName:
      "h-7 sm:h-8 w-auto max-h-8 object-contain opacity-85 hover:opacity-100 transition-opacity",
  },
] as const;

export default function Footer() {
  const { dict } = useLocale();

  return (
    <footer className="w-full bg-[#FFF9F0] text-black border-t border-[#3D1A00]/10">
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 items-center md:items-start text-center md:text-left">
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <LocaleLink href="/" className="inline-block group">
              <span
                className="font-['Montserrat'] font-light text-[2rem] lg:text-[2.5rem] leading-none tracking-[0.16em] lg:tracking-[0.18em] text-black transition-opacity duration-300 group-hover:opacity-80"
              >
                {SITE_WORDMARK}
              </span>
            </LocaleLink>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed w-full text-left tracking-normal">
              {dict.brand.footerLead}
            </p>
            <p className="text-xs text-gray-500 text-left tracking-normal">
              {dict.brand.footerLegal}
            </p>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">{dict.nav.navigation}</h3>
            <nav className="flex flex-col gap-3 justify-center md:justify-start w-full">
              <LocaleLink
                href="/catalog"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.catalog}
              </LocaleLink>
              <LocaleLink
                href="/info#about"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.aboutBrand}
              </LocaleLink>
              <LocaleLink
                href="/partnership"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.partnership}
              </LocaleLink>
              <LocaleLink
                href="/delivery-and-payment"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.deliveryPayment}
              </LocaleLink>
              <LocaleLink
                href="/info#faq"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.faq}
              </LocaleLink>
              <LocaleLink
                href="/contacts"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                {dict.nav.contacts}
              </LocaleLink>
            </nav>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">{dict.footer.documents}</h3>
            <nav className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start">
              <LocaleLink
                href="/privacy-policy"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 tracking-normal"
              >
                {dict.footer.privacy}
              </LocaleLink>
              <LocaleLink
                href="/terms-of-service"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 tracking-normal"
              >
                {dict.footer.terms}
              </LocaleLink>
              <LocaleLink
                href="/returns-and-exchange"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 tracking-normal"
              >
                {dict.nav.returnsExchange}
              </LocaleLink>
            </nav>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0 lg:max-w-none">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">{dict.contacts.title}</h3>
            <LocaleLink
              href="/contacts"
              className="text-[#3D1A00] hover:opacity-80 transition-opacity font-['Montserrat']"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(24px, 4vw, 36px)",
                lineHeight: "120%",
                letterSpacing: "0%",
              }}
            >
              {dict.footer.contactCta.toUpperCase()}
            </LocaleLink>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-left">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 mb-1.5 font-['Montserrat']">
                  {dict.footer.address}
                </p>
                <address className="not-italic text-sm text-gray-700 font-['Montserrat'] leading-relaxed space-y-0.5">
                  {dict.footer.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </address>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 mb-1.5 font-['Montserrat']">
                  {dict.checkout.phone}
                </p>
                <a
                  href={`tel:${siteContact.phoneTel}`}
                  className="text-sm text-gray-700 hover:text-[#3D1A00] transition-colors font-['Montserrat']"
                >
                  {siteContact.phoneDisplay}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 mb-1.5 font-['Montserrat']">
                  E-mail
                </p>
                <a
                  href={`mailto:${siteContact.email}`}
                  className="text-sm text-gray-700 hover:text-[#3D1A00] transition-colors font-['Montserrat'] break-all"
                >
                  {siteContact.email}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 mb-1.5 font-['Montserrat']">
                  {dict.footer.schedule}
                </p>
                <div className="text-sm text-gray-700 font-['Montserrat'] leading-relaxed space-y-0.5">
                  {dict.footer.scheduleLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start pt-1">
              <LocaleLink
                href={siteContact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 group tracking-normal"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span>Instagram — {siteContact.instagramHandle}</span>
              </LocaleLink>
              <LocaleLink
                href={siteContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 group tracking-normal"
                >
                <svg
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity text-gray-600 group-hover:text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Telegram</span>
              </LocaleLink>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-[#3D1A00]/10">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 mb-4 text-center md:text-left font-['Montserrat']">
            {dict.footer.paymentMethods}
          </p>
          <ul
            className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8 list-none p-0 m-0"
            aria-label={dict.footer.paymentSystemsAria}
          >
            {PAYMENT_LOGOS.map(({ src, alt, width, height, imageClassName }) => (
              <li key={src} className="flex items-center">
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className={imageClassName}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#3D1A00]/10">
        <div className="max-w-[1920px] mx-auto px-6 py-5">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-500">
              <span className="tracking-normal">{dict.brand.footerLegal}</span>
            </div>
            <div>
              <a
                href="https://new.telebots.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold font-['Montserrat'] text-black hover:text-gray-700 transition-colors tracking-wide"
              >
                {dict.footer.developedBy}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
