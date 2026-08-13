import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildInfoLayoutMetadata } from "@/lib/i18n/pages/infoMeta";

export function generateMetadata(): Metadata {
  return buildInfoLayoutMetadata(LOCALE_RU);
}

export default function RuInfoLayout({ children }: { children: ReactNode }) {
  return children;
}
