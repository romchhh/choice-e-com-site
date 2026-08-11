import ProductClientWrapper from "./ProductClientWrapper";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import type { Product } from "@/lib/types/product";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteLocaleUrl, getSiteOrigin } from "@/lib/i18n/seo";

interface ProductServerProps {
  product: Product;
}

export default async function ProductServer({ product }: ProductServerProps) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const origin = getSiteOrigin();
  const productSlug = product.slug || String(product.id);
  const categorySlug =
    product.category_slug ??
    (product.category_name ? encodeURIComponent(product.category_name) : null);

  const breadcrumbs = [
    { name: dict.nav.home, url: absoluteLocaleUrl("/", locale) },
    { name: dict.catalog.title, url: absoluteLocaleUrl("/catalog", locale) },
    ...(product.category_name
      ? [
          {
            name: product.category_name,
            url: absoluteLocaleUrl(
              `/catalog/${categorySlug || encodeURIComponent(product.category_name)}`,
              locale
            ),
          },
        ]
      : []),
    {
      name: product.name,
      url: absoluteLocaleUrl(`/product/${productSlug}`, locale),
    },
  ];

  const productForStructuredData = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    discount_percentage: product.discount_percentage,
    in_stock: (product as any).in_stock ?? null,
    stock: (product as any).stock ?? null,
    first_media: product.media?.length ? product.media[0] : null,
    category_name: product.category_name,
  };

  return (
    <>
      <ProductStructuredData
        product={productForStructuredData}
        baseUrl={origin}
        slug={productSlug}
        locale={locale}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <ProductClientWrapper key={product.id} product={product} />
    </>
  );
}
