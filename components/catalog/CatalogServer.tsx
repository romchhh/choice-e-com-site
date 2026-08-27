import CatalogClient from "./CatalogClient";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllCategories
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeList, localizeCategoryFields } from "@/lib/i18n/localizeCatalog";
import {
  absoluteLocaleUrl,
  catalogSeoCopy,
  getSiteOrigin,
  plainTextForMeta,
} from "@/lib/i18n/seo";

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number | null;
  is_promo?: boolean;
  free_delivery_badge?: boolean;
  doctor_choice_badge?: boolean;
  category_id?: number | null;
  category_ids?: number[] | null;
  subcategory_id?: number | null;
  subcategory_ids?: number[] | null;
  stock?: number;
  in_stock?: boolean;
  package_weight?: string | null;
  course?: string | null;
  [key: string]: unknown;
}

interface CatalogServerProps {
  locale?: Locale;
  category?: string | null;
  subcategory?: string | null;
  categoryId?: number | null;
  categoryDescription?: string | null;
  /** ЧПУ категорії для canonical URL у structured data */
  categorySlug?: string | null;
}

async function getProducts(params: CatalogServerProps): Promise<Product[]> {
  const { category, subcategory } = params;
  
  try {
    if (subcategory) {
      return await sqlGetProductsBySubcategoryName(subcategory);
    } else if (category) {
      return await sqlGetProductsByCategory(category);
    }
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getCategories(): Promise<{ id: number; name: string; description?: string | null; name_ru?: string | null; description_ru?: string | null }[]> {
  try {
    const data = await sqlGetAllCategories();
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      description: (c as any).description ?? null,
      name_ru: (c as any).name_ru ?? null,
      description_ru: (c as any).description_ru ?? null,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function CatalogServer(props: CatalogServerProps) {
  const locale = props.locale ?? DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const [productsRaw, categoriesRaw] = await Promise.all([
    getProducts(props),
    getCategories(),
  ]);

  const products = localizeList(productsRaw, locale, "product");
  const categories = categoriesRaw.map((c) => localizeCategoryFields(c, locale));

  const origin = getSiteOrigin();
  const categoryName = props.category || props.subcategory || null;
  const matchedCategory =
    categoryName
      ? categories.find(
          (c) =>
            c.name === categoryName ||
            (c as { name_uk?: string }).name_uk === categoryName ||
            (c as { name_ru?: string | null }).name_ru === categoryName
        )
      : undefined;
  const displayCategory = matchedCategory?.name || categoryName;
  const catalogPathBare = props.categorySlug
    ? `/catalog/${props.categorySlug}`
    : "/catalog";
  const catalogUrl = absoluteLocaleUrl(catalogPathBare, locale);

  const seo = catalogSeoCopy(locale, {
    categoryName: displayCategory,
    categoryDescription:
      props.categoryDescription ??
      (matchedCategory as { description?: string | null } | undefined)?.description ??
      null,
    productCount: products.length,
  });

  const pageDescription =
    plainTextForMeta(props.categoryDescription, 200) || seo.description;

  const breadcrumbs = [
    { name: dict.nav.home, url: absoluteLocaleUrl("/", locale) },
    { name: dict.catalog.title, url: absoluteLocaleUrl("/catalog", locale) },
    ...(displayCategory && props.categorySlug
      ? [{ name: displayCategory, url: catalogUrl }]
      : displayCategory
        ? [{ name: displayCategory, url: catalogUrl }]
        : []),
  ];

  const listItems = products.slice(0, 24).map((p, index) => {
    const slug = p.slug || String(p.id);
    const image = p.first_media?.url
      ? `${origin}/api/images/${p.first_media.url}`
      : null;
    return {
      name: p.name,
      url: absoluteLocaleUrl(`/product/${slug}`, locale),
      image,
      position: index + 1,
    };
  });

  return (
    <>
      <CollectionPageStructuredData
        name={seo.h1 === dict.catalog.title ? seo.ogTitle : `${seo.h1} | ${dict.catalog.title}`}
        description={pageDescription}
        url={catalogUrl}
        baseUrl={origin}
        itemCount={products.length}
        category={displayCategory || undefined}
        locale={locale}
        breadcrumbItems={breadcrumbs}
        items={listItems}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <CatalogClient
        initialProducts={products}
        categories={categories}
        initialSelectedCategoryIds={props.categoryId ? [props.categoryId] : undefined}
        selectedCategoryDescription={props.categoryDescription ?? null}
        pageHeading={seo.h1}
        pageIntro={
          displayCategory
            ? pageDescription
            : locale === "ru"
              ? "Оригинальная продукция Choice: wellness, уход и eco-средства."
              : "Оригінальна продукція Choice: wellness, догляд та eco-засоби."
        }
        activeCategoryLabel={displayCategory}
      />
    </>
  );
}
