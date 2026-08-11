import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/getLocale";
import { getContactsCopy } from "@/lib/i18n/content/contacts";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getContactsCopy(locale);
  return buildPageMetadata(locale, "/contacts", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogType: "website",
  });
}

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return children;
}
