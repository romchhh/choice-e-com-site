"use client";

import HomeProductSection from "@/components/main-page/HomeProductSection";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Promotions() {
  const { dict } = useLocale();

  return (
    <HomeProductSection
      mode="promos"
      title={dict.home.promotions}
      lead={dict.home.promotionsLead}
      catalogHref="/catalog?promo=1"
      catalogLabel={dict.home.allPromos}
      tone="white"
    />
  );
}
