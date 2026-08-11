import CatalogClient from "./CatalogClient";
import { SITE_STORE_NAME, SITE_PRODUCT_BRAND } from "@/lib/siteBrand";
import { 
  sqlGetAllProducts, 
  sqlGetProductsByCategory, 
  sqlGetProductsBySubcategoryName,
  sqlGetAllCategories
} from "@/lib/sql";
import { CollectionPageStructuredData, BreadcrumbStructuredData } from "@/components/shared/StructuredData";
import { getLocale } from "@/lib/i18n/getLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizeList, localizeCategoryFields } from "@/lib/i18n/localizeCatalog";
import { absoluteLocaleUrl, getSiteOrigin } from "@/lib/i18n/seo";

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
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Parallel data fetching for better performance
  const [productsRaw, categoriesRaw] = await Promise.all([
    getProducts(props),
    getCategories(),
  ]);

  const products = localizeList(productsRaw, locale, "product");
  const categories = categoriesRaw.map((c) => localizeCategoryFields(c, locale));

  const origin = getSiteOrigin();
  const categoryName = props.category || props.subcategory || null;
  const localizedCategoryName =
    categoryName &&
    categories.find((c) => c.name === categoryName || (c as any).name_ru === categoryName)?.name;
  const displayCategory = localizedCategoryName || categoryName;
  const catalogPathBare = props.categorySlug
    ? `/catalog/${props.categorySlug}`
    : "/catalog";
  const catalogUrl = absoluteLocaleUrl(catalogPathBare, locale);
  const pageName = displayCategory || dict.catalog.title;
  const pageDescription = displayCategory
    ? locale === "ru"
      ? `Каталог товаров категории «${displayCategory}» в ${SITE_STORE_NAME}. Оригинальная продукция ${SITE_PRODUCT_BRAND}, wellness и eco-средства.`
      : `Каталог товарів категорії «${displayCategory}» у ${SITE_STORE_NAME}. Оригінальна продукція ${SITE_PRODUCT_BRAND}, wellness та eco-засоби.`
    : locale === "ru"
    ? `Каталог оригинальной продукции ${SITE_PRODUCT_BRAND} в интернет-магазине ${SITE_STORE_NAME}: wellness-комплексы, натуральный уход и eco-товары.`
    : `Каталог оригінальної продукції ${SITE_PRODUCT_BRAND} в інтернет-магазині ${SITE_STORE_NAME}: wellness-комплекси, натуральний догляд та eco-товари.`;

  const breadcrumbs = [
    { name: dict.nav.home, url: absoluteLocaleUrl("/", locale) },
    { name: dict.catalog.title, url: absoluteLocaleUrl("/catalog", locale) },
    ...(displayCategory ? [{ name: displayCategory, url: catalogUrl }] : []),
  ];

  return (
    <>
      <CollectionPageStructuredData
        name={pageName}
        description={pageDescription}
        url={catalogUrl}
        baseUrl={origin}
        itemCount={products.length}
        category={displayCategory || undefined}
        locale={locale}
        breadcrumbItems={breadcrumbs}
      />
      <BreadcrumbStructuredData items={breadcrumbs} />
      <CatalogClient
        initialProducts={products}
        categories={categories}
        initialSelectedCategoryIds={props.categoryId ? [props.categoryId] : undefined}
        selectedCategoryDescription={props.categoryDescription ?? null}
      />
    </>
  );
}

