import LocaleLink from "@/components/i18n/LocaleLink";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildForbiddenMetadata } from "@/lib/i18n/pages/forbiddenMeta";

export function generateMetadata() {
  return buildForbiddenMetadata(LOCALE_UK);
}

export default function ForbiddenPage() {
  return <ForbiddenPageContent locale={LOCALE_UK} />;
}

export function ForbiddenPageContent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <p
          className="text-[clamp(4rem,14vw,8rem)] font-light font-['Montserrat'] text-[#3D1A00]/12 leading-none tracking-tighter select-none"
          aria-hidden
        >
          403
        </p>

        <div className="relative -mt-12 md:-mt-20 space-y-4">
          <h1 className="text-2xl md:text-3xl font-medium font-['Montserrat'] text-[#3D1A00] tracking-tight">
            {dict.forbidden.title}
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <LocaleLink
            href="/"
            className="px-6 py-3 bg-[#3D1A00] text-[#FFF9F0] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#2d1200] transition-colors rounded-full"
          >
            {dict.forbidden.back}
          </LocaleLink>
          <LocaleLink
            href="/contacts"
            className="px-6 py-3 border-2 border-[#3D1A00] text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00] hover:text-[#FFF9F0] transition-colors rounded-full"
          >
            {dict.nav.contacts}
          </LocaleLink>
        </div>

        <p className="mt-12 text-xs font-['Montserrat'] text-[#3D1A00]/50">
          {SITE_STORE_NAME}
        </p>
      </div>
    </div>
  );
}
