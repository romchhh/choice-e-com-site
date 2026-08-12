import { headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_HEADER, normalizeLocale, type Locale } from "@/lib/i18n/config";
import { buildMerchantFeed } from "@/lib/merchantFeed";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang") || url.searchParams.get("locale");
  let locale: Locale = DEFAULT_LOCALE;
  if (langParam === "ru" || langParam === "uk") {
    locale = langParam;
  } else {
    try {
      const h = await headers();
      locale = normalizeLocale(h.get(LOCALE_HEADER));
    } catch {
      locale = DEFAULT_LOCALE;
    }
  }
  return buildMerchantFeed(locale);
}
