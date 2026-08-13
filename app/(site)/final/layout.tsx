import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildFinalLayoutMetadata } from "@/lib/i18n/pages/finalMeta";

export function generateMetadata(): Metadata {
  return buildFinalLayoutMetadata(LOCALE_UK);
}

export default function FinalLayout({ children }: { children: ReactNode }) {
  return children;
}
