import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import {
  buildTermsMetadata,
  TermsOfServicePageContent,
} from "../../(site)/terms-of-service/page";

export function generateMetadata(): Metadata {
  return buildTermsMetadata(LOCALE_RU);
}

export default function RuTermsPage() {
  return <TermsOfServicePageContent locale={LOCALE_RU} />;
}
