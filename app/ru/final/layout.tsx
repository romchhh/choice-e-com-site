import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildFinalLayoutMetadata } from "@/lib/i18n/pages/finalMeta";

export function generateMetadata(): Metadata {
  return buildFinalLayoutMetadata(LOCALE_RU);
}

export default function RuFinalLayout({ children }: { children: ReactNode }) {
  return children;
}
