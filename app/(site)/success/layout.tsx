import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildSuccessLayoutMetadata } from "@/lib/i18n/pages/successMeta";

export function generateMetadata(): Metadata {
  return buildSuccessLayoutMetadata(LOCALE_UK);
}

export default function SuccessLayout({ children }: { children: ReactNode }) {
  return children;
}
