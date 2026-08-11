import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@/lib/i18n/getLocale";
import { getInfoCopy } from "@/lib/i18n/content/info";
import { buildPageMetadata } from "@/lib/i18n/content/pageMeta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getInfoCopy(locale);
  return buildPageMetadata(locale, "/info", {
    title: t.metaTitle,
    description: t.metaDescription,
    ogType: "website",
  });
}

export default function InfoLayout({ children }: { children: ReactNode }) {
  return children;
}
