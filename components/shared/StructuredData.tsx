"use client";

import {
  SITE_PRODUCT_BRAND,
  SITE_STORE_NAME,
  siteFooterLead,
} from "@/lib/siteBrand";

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
        urlTemplate: `${normalizedBaseUrl}/catalog?q={search_term_string}`,
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

export function ProductStructuredData({ product, baseUrl = defaultBaseUrl, slug }: ProductStructuredDataProps) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const imageUrl = product.first_media
    ? `${normalizedBaseUrl}/api/images/${product.first_media.url}`
    : `${normalizedBaseUrl}/images/browser-open.png`;
  const productUrl = slug ? `${normalizedBaseUrl}/product/${slug}` : `${normalizedBaseUrl}/product/${product.id}`;

  const isInStock =
    product.in_stock !== false &&
    (typeof product.stock !== "number" || product.stock > 0);

  const offer = {
    "@type": "Offer",
    price: product.discount_percentage
      ? (product.price * (1 - product.discount_percentage / 100)).toFixed(2)
      : product.price.toFixed(2),
    priceCurrency: "UAH",
    availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: productUrl,
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} — оригінальна продукція ${SITE_PRODUCT_BRAND}, ${SITE_STORE_NAME}`,
    image: imageUrl,
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
      availableLanguage: ["Ukrainian"],
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
}

export function CollectionPageStructuredData({
  name,
  description,
  url,
  baseUrl,
  itemCount = 0,
  category,
}: CollectionPageStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemCount,
      ...(category && {
        itemListElement: {
          "@type": "ListItem",
          name: category,
        },
      }),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Головна",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Каталог",
          item: `${baseUrl}/catalog`,
        },
        ...(category
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: category,
                item: url,
              },
            ]
          : []),
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

