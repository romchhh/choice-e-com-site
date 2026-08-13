import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import {
  buildPrivacyMetadata,
  PrivacyPolicyPageContent,
} from "../../(site)/privacy-policy/page";

export function generateMetadata(): Metadata {
  return buildPrivacyMetadata(LOCALE_RU);
}

export default function RuPrivacyPage() {
  return <PrivacyPolicyPageContent locale={LOCALE_RU} />;
}
