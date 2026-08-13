import type { Metadata } from "next";
import { LOCALE_RU } from "@/lib/i18n/localePage";
import { productSlugsStaticParams } from "@/lib/pages/staticParams";
import {
  buildProductPageMetadata,
  ProductPageContent,
} from "@/lib/pages/productPage";

export const revalidate = 1200;

export async function generateStaticParams() {
  return productSlugsStaticParams();
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return buildProductPageMetadata(LOCALE_RU, props.params);
}

export default function RuProductPage(props: PageProps) {
  return <ProductPageContent locale={LOCALE_RU} {...props} />;
}
