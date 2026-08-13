import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import {
  buildPartnershipMetadata,
  PartnershipPageContent,
} from "../../(site)/partnership/page";

export function generateMetadata(): Metadata {
  return buildPartnershipMetadata(LOCALE_RU);
}

export default function RuPartnershipPage() {
  return <PartnershipPageContent locale={LOCALE_RU} />;
}
