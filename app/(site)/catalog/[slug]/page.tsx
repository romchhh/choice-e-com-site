import type { Metadata } from "next";
import { LOCALE_UK } from "@/lib/i18n/localePage";
import { categorySlugsStaticParams } from "@/lib/pages/staticParams";
import {
  buildCatalogSlugPageMetadata,
  CatalogSlugPageContent,
} from "@/lib/pages/catalogSlugPage";

export const revalidate = 1200;

export async function generateStaticParams() {
  return categorySlugsStaticParams();
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return buildCatalogSlugPageMetadata(LOCALE_UK, props.params);
}

export default function CatalogSlugPage(props: PageProps) {
  return <CatalogSlugPageContent locale={LOCALE_UK} {...props} />;
}
