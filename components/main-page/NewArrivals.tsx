"use client";

import HomeProductSection from "@/components/main-page/HomeProductSection";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function NewArrivals() {
  const { dict } = useLocale();

  return (
    <HomeProductSection
      mode="newArrivals"
      title={dict.home.newArrivals}
      lead={dict.home.newArrivalsLead}
      catalogHref="/catalog"
      catalogLabel={dict.home.allCatalog}
      tone="cream"
    />
  );
}
