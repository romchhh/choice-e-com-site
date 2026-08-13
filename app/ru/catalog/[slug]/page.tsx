import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { categorySlugsStaticParams } from "@/lib/pages/staticParams";
import {
  buildCatalogSlugPageMetadata,
  CatalogSlugPageContent,
} from "@/lib/pages/catalogSlugPage";

export const revalidate = 1200;
export const dynamicParams = true;

export async function generateStaticParams() {
  return categorySlugsStaticParams();
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return buildCatalogSlugPageMetadata(LOCALE_RU, props.params);
}

export default function RuCatalogSlugPage(props: PageProps) {
  return <CatalogSlugPageContent locale={LOCALE_RU} {...props} />;
}
