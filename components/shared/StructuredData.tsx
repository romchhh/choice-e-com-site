"use client";

import {
  SITE_PRODUCT_BRAND,
  SITE_STORE_NAME,
  siteFooterLead,
} from "@/lib/siteBrand";
import { getDiscountedPrice } from "@/lib/pricing";

interface ProductStructuredDataProps {
  product: {
    id: number;
    name: string;
    description?: string | null;
    price: number;
    discount_percentage?: number | null;
    in_stock?: boolean | null;
    stock?: number | null;
    first_media?: { url: string; type: string } | null;
    category_name?: string | null;
  };
  baseUrl?: string;
  slug?: string; // ЧПУ для URL
  locale?: "uk" | "ru";
}

interface OrganizationStructuredDataProps {
  name?: string;
  url?: string;
  logo?: string;
  baseUrl?: string;
}

const defaultBaseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Schema.org WebSite — для пошукових систем і rich results */
export function WebSiteStructuredData({
  name = SITE_STORE_NAME,
  description = siteFooterLead,
  baseUrl = defaultBaseUrl,
  locale = "uk_UA",
}: {
  name?: string;
  description?: string;
  baseUrl?: string;
  locale?: string;
}) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const isRu =
    locale === "ru-RU" || locale === "ru_RU" || locale.startsWith("ru");
  const catalogSearchBase = isRu
    ? `${normalizedBaseUrl}/ru/catalog`
    : `${normalizedBaseUrl}/catalog`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: normalizedBaseUrl,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${catalogSearchBase}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_STORE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${normalizedBaseUrl}/images/browser-open.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ProductStructuredData({
  product,
  baseUrl = defaultBaseUrl,
  slug,
  locale = "uk",
}: ProductStructuredDataProps) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const imageUrl = product.first_media
    ? `${normalizedBaseUrl}/api/images/${product.first_media.url}`
    : `${normalizedBaseUrl}/images/browser-open.png`;
  const path = `/product/${slug || product.id}`;
  const productUrl =
    locale === "ru" ? `${normalizedBaseUrl}/ru${path}` : `${normalizedBaseUrl}${path}`;

  const isInStock =
    product.in_stock !== false &&
    (typeof product.stock !== "number" || product.stock > 0);

  const offer = {
    "@type": "Offer",
    price: getDiscountedPrice(product.price, product.discount_percentage).toFixed(2),
    priceCurrency: "UAH",
    availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: productUrl,
    priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)
      .toISOString()
      .slice(0, 10),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} — ${SITE_PRODUCT_BRAND}, ${SITE_STORE_NAME}`,
    image: imageUrl,
    url: productUrl,
    inLanguage: locale === "ru" ? "ru-RU" : "uk-UA",
    brand: {
      "@type": "Brand",
      name: SITE_PRODUCT_BRAND,
    },
    seller: {
      "@type": "Organization",
      name: SITE_STORE_NAME,
      url: normalizedBaseUrl,
    },
    category: product.category_name || "Wellness",
    offers: offer,
    sku: `forbodyspace-${product.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData({
  name = SITE_STORE_NAME,
  url,
  logo,
  baseUrl = defaultBaseUrl,
}: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: url || baseUrl,
    logo: logo || `${baseUrl}/images/browser-open.png`,
    sameAs: [
      "https://www.instagram.com/my_choice_mari",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: ["Ukrainian", "Russian"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: { name: string; url: string }[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CollectionPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  baseUrl: string;
  itemCount?: number;
  category?: string;
  locale?: "uk" | "ru";
  breadcrumbItems?: { name: string; url: string }[];
  /** Product list for ItemList rich results (max ~30) */
  items?: { name: string; url: string; image?: string | null; position?: number }[];
}

export function CollectionPageStructuredData({
  name,
  description,
  url,
  baseUrl,
  itemCount = 0,
  category,
  locale = "uk",
  breadcrumbItems,
  items,
}: CollectionPageStructuredDataProps) {
  const origin = normalizeBaseUrl(baseUrl);
  const homeUrl = locale === "ru" ? `${origin}/ru` : origin;
  const catalogUrl = locale === "ru" ? `${origin}/ru/catalog` : `${origin}/catalog`;
  const crumbs =
    breadcrumbItems && breadcrumbItems.length > 0
      ? breadcrumbItems
      : [
          { name: locale === "ru" ? "Главная" : "Головна", url: homeUrl },
          { name: "Каталог", url: catalogUrl },
          ...(category ? [{ name: category, url }] : []),
        ];

  const listElements =
    items && items.length > 0
      ? items.slice(0, 30).map((item, index) => ({
          "@type": "ListItem",
          position: item.position ?? index + 1,
          name: item.name,
          url: item.url,
          ...(item.image ? { image: item.image } : {}),
        }))
      : category
        ? [{ "@type": "ListItem", position: 1, name: category }]
        : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    inLanguage: locale === "ru" ? "ru-RU" : "uk-UA",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_STORE_NAME,
      url: origin,
    },
    mainEntity: {
      "@type": "ItemList",
      name,
      numberOfItems: itemCount || items?.length || 0,
      ...(listElements ? { itemListElement: listElements } : {}),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

