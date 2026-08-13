import type { Metadata } from "next";
import { LOCALE_UK } from "@/lib/i18n/localePage";
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
  return buildProductPageMetadata(LOCALE_UK, props.params);
}

export default function ProductPage(props: PageProps) {
  return <ProductPageContent locale={LOCALE_UK} {...props} />;
}
