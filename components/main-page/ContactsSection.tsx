"use client";

import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { siteContact } from "@/lib/siteContact";

export default function ContactsSection() {
  const { dict } = useLocale();

  return (
    <section id="contacts" className="scroll-mt-20 w-full bg-[#FFF9F0] py-16 lg:py-24">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <LocaleLink
            href="/contacts"
            className="inline-block text-[#3D1A00] font-['Montserrat'] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity mb-8"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 5vw, 48px)",
              lineHeight: "120%",
              letterSpacing: "0.02em",
            }}
          >
            {dict.home.contactsTitle}
          </LocaleLink>

          <div className="space-y-4 text-[#3D1A00] font-['Montserrat'] text-base lg:text-lg mb-8">
            <p>
              <a href={`tel:${siteContact.phoneTel}`} className="hover:opacity-80">
                {siteContact.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${siteContact.email}`} className="hover:opacity-80">
                {siteContact.email}
              </a>
            </p>
            {siteContact.instagramUrl ? (
              <p>
                <a
                  href={siteContact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  Instagram
                </a>
              </p>
            ) : null}
            {siteContact.telegramUrl ? (
              <p>
                <a
                  href={siteContact.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  Telegram
                </a>
              </p>
            ) : null}
          </div>

          <div className="pt-6 border-t border-black/10">
            <p className="text-base font-['Montserrat'] text-black/80 mb-4">
              {dict.home.contactsFormHint}
            </p>
            <LocaleLink
              href="/contacts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D1A00] text-white font-['Montserrat'] hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(20px, 3vw, 36px)",
                lineHeight: "120%",
                letterSpacing: "0%",
              }}
            >
              {dict.footer.contactCta.toUpperCase()}
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
