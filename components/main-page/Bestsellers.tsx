"use client";

import HomeProductSection from "@/components/main-page/HomeProductSection";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Bestsellers() {
  const { dict } = useLocale();

  return (
    <HomeProductSection
      mode="bestsellers"
      title={dict.home.bestsellers}
      lead={dict.home.bestsellersLead}
      catalogHref="/catalog"
      catalogLabel={dict.home.allCatalog}
      tone="white"
    />
  );
}
