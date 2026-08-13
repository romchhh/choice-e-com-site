import type { Metadata } from "next";
import SiteHtmlShell from "@/components/SiteHtmlShell";
import { buildSiteLayoutMetadata } from "@/lib/i18n/siteLayoutMeta";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import "../(site)/critical.css";
import "../(site)/globals.css";
import "../(site)/mobile-optimizations.css";

export function generateMetadata(): Metadata {
  return buildSiteLayoutMetadata(LOCALE_RU);
}

export default function RuRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteHtmlShell locale={LOCALE_RU}>{children}</SiteHtmlShell>;
}
