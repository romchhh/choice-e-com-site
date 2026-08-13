import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildContactsLayoutMetadata } from "@/lib/i18n/pages/contactsMeta";

export function generateMetadata(): Metadata {
  return buildContactsLayoutMetadata(LOCALE_UK);
}

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return children;
}
