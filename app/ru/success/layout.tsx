import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildSuccessLayoutMetadata } from "@/lib/i18n/pages/successMeta";

export function generateMetadata(): Metadata {
  return buildSuccessLayoutMetadata(LOCALE_RU);
}

export default function RuSuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
