import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { buildForbiddenMetadata } from "@/lib/i18n/pages/forbiddenMeta";
import { ForbiddenPageContent } from "../../(site)/forbidden/page";

export function generateMetadata(): Metadata {
  return buildForbiddenMetadata(LOCALE_RU);
}

export default function RuForbiddenPage() {
  return <ForbiddenPageContent locale={LOCALE_RU} />;
}
