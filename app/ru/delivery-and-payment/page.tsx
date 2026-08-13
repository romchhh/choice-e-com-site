import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import {
  buildDeliveryMetadata,
  DeliveryAndPaymentPageContent,
} from "../../(site)/delivery-and-payment/page";

export function generateMetadata(): Metadata {
  return buildDeliveryMetadata(LOCALE_RU);
}

export default function RuDeliveryPage() {
  return <DeliveryAndPaymentPageContent locale={LOCALE_RU} />;
}
