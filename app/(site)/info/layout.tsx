import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { buildInfoLayoutMetadata } from "@/lib/i18n/pages/infoMeta";

export function generateMetadata(): Metadata {
  return buildInfoLayoutMetadata(LOCALE_UK);
}

export default function InfoLayout({ children }: { children: ReactNode }) {
  return children;
}
