import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildContactsLayoutMetadata } from "@/lib/i18n/pages/contactsMeta";

export function generateMetadata(): Metadata {
  return buildContactsLayoutMetadata(LOCALE_RU);
}

export default function RuContactsLayout({ children }: { children: ReactNode }) {
  return children;
}
