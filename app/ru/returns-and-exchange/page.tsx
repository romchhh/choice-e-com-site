import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import {
  buildReturnsMetadata,
  ReturnsAndExchangePageContent,
} from "../../(site)/returns-and-exchange/page";

export function generateMetadata(): Metadata {
  return buildReturnsMetadata(LOCALE_RU);
}

export default function RuReturnsPage() {
  return <ReturnsAndExchangePageContent locale={LOCALE_RU} />;
}
