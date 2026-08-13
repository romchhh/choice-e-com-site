import type { Metadata } from "next";
import SiteHtmlShell from "@/components/SiteHtmlShell";
import { buildSiteLayoutMetadata } from "@/lib/i18n/siteLayoutMeta";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import "./critical.css";
import "./globals.css";
import "./mobile-optimizations.css";

export function generateMetadata(): Metadata {
  return buildSiteLayoutMetadata(LOCALE_UK);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteHtmlShell locale={LOCALE_UK}>{children}</SiteHtmlShell>;
}
