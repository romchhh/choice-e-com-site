import type { Metadata } from "next";
import type { Locale } from "./config";
import { localePath } from "./paths";
import { SITE_PRODUCT_BRAND, SITE_STORE_NAME } from "@/lib/siteBrand";

/** Absolute site origin without trailing slash. */
export function getSiteOrigin(): string {
  return (
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Absolute URL for a locale + path (path must start with / or be ""). */
export function absoluteLocaleUrl(path: string, locale: Locale): string {
  const origin = getSiteOrigin();
  const localized = localePath(path || "/", locale);
  if (localized === "/") return origin;
  return `${origin}${localized}`;
}

/** uk + ru + x-default language map for a bare path (no /ru prefix). */
export function hreflangAlternates(path: string): Record<string, string> {
  const bare = path.startsWith("/") ? path : `/${path}`;
  return {
    uk: absoluteLocaleUrl(bare, "uk"),
    ru: absoluteLocaleUrl(bare, "ru"),
    "x-default": absoluteLocaleUrl(bare, "uk"),
  };
}

/** Strip HTML / collapse whitespace for meta descriptions. */
export function plainTextForMeta(
  input: string | null | undefined,
  maxLen = 160
): string {
  if (!input) return "";
  const text = String(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export type BuildSeoOptions = {
  /** Path without locale prefix, e.g. `/catalog` or `/product/foo`. Use `/` for home. */
  path: string;
  locale: Locale;
  title: string;
  description: string;
  keywords?: string | string[];
  ogType?: "website" | "article" | "product";
  /** Absolute or site-relative image URL */
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
};

/**
 * Full bilingual SEO metadata: canonical, hreflang, Open Graph, Twitter.
 */
export function buildSeoMetadata(opts: BuildSeoOptions): Metadata {
  const {
    path,
    locale,
    title,
    description,
    keywords,
    ogType = "website",
    image,
    imageAlt,
    noIndex = false,
  } = opts;

  const origin = getSiteOrigin();
  const canonical = absoluteLocaleUrl(path, locale);
  const desc = plainTextForMeta(description, 168);
  const ogLocale = locale === "ru" ? "ru_RU" : "uk_UA";
  const altLocale = locale === "ru" ? "uk_UA" : "ru_RU";
  const defaultImage = `${origin}/images/tg_image_3614117882.png`;
  const imageUrl =
    !image
      ? defaultImage
      : image.startsWith("http://") || image.startsWith("https://")
        ? image
        : `${origin}${image.startsWith("/") ? image : `/${image}`}`;

  const kw =
    typeof keywords === "string"
      ? keywords
      : Array.isArray(keywords)
        ? keywords.filter(Boolean).join(", ")
        : undefined;

  return {
    title,
    description: desc,
    keywords: kw,
    authors: [{ name: SITE_STORE_NAME }],
    creator: SITE_STORE_NAME,
    publisher: SITE_STORE_NAME,
    metadataBase: new URL(origin),
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description: desc,
      type: ogType === "product" ? "website" : ogType,
      locale: ogLocale,
      alternateLocale: [altLocale],
      url: canonical,
      siteName: SITE_STORE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
    },
  };
}

/** Catalog listing / category SEO copy. */
export function catalogSeoCopy(
  locale: Locale,
  opts?: {
    categoryName?: string | null;
    categoryDescription?: string | null;
    productCount?: number | null;
  }
): {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  ogTitle: string;
} {
  const categoryName = opts?.categoryName?.trim() || null;
  const count = opts?.productCount != null && opts.productCount > 0 ? opts.productCount : null;
  const countBitUk = count != null ? ` ${count} товарів у категорії.` : "";
  const countBitRu = count != null ? ` ${count} товаров в категории.` : "";
  const fromDesc = plainTextForMeta(opts?.categoryDescription, 120);

  if (categoryName) {
    if (locale === "ru") {
      const fallback = `Купить продукцию категории «${categoryName}» в ${SITE_STORE_NAME} — официальный представитель ${SITE_PRODUCT_BRAND}. Wellness и eco с доставкой по Украине.${countBitRu}`;
      return {
        h1: categoryName,
        title: `${categoryName}: купить онлайн | ${SITE_STORE_NAME}`,
        ogTitle: `${categoryName} — ${SITE_PRODUCT_BRAND} | ${SITE_STORE_NAME}`,
        description: plainTextForMeta(
          fromDesc
            ? `${fromDesc} Каталог «${categoryName}» в ${SITE_STORE_NAME}.${countBitRu}`
            : fallback,
          168
        ),
        keywords: [
          categoryName,
          `купить ${categoryName}`,
          SITE_STORE_NAME,
          SITE_PRODUCT_BRAND,
          "wellness",
          "фитокомплексы",
          "eco",
          "Украина",
        ].join(", "),
      };
    }
    const fallback = `Купити продукцію категорії «${categoryName}» у ${SITE_STORE_NAME} — офіційний представник ${SITE_PRODUCT_BRAND}. Wellness та eco з доставкою по Україні.${countBitUk}`;
    return {
      h1: categoryName,
      title: `${categoryName}: купити онлайн | ${SITE_STORE_NAME}`,
      ogTitle: `${categoryName} — ${SITE_PRODUCT_BRAND} | ${SITE_STORE_NAME}`,
      description: plainTextForMeta(
        fromDesc
          ? `${fromDesc} Каталог «${categoryName}» у ${SITE_STORE_NAME}.${countBitUk}`
          : fallback,
        168
      ),
      keywords: [
        categoryName,
        `купити ${categoryName}`,
        SITE_STORE_NAME,
        SITE_PRODUCT_BRAND,
        "wellness",
        "фітокомплекси",
        "eco",
        "Україна",
      ].join(", "),
    };
  }

  if (locale === "ru") {
    return {
      h1: "Каталог",
      title: `Каталог ${SITE_PRODUCT_BRAND}: wellness и eco | ${SITE_STORE_NAME}`,
      ogTitle: `Каталог продукции ${SITE_PRODUCT_BRAND} | ${SITE_STORE_NAME}`,
      description: plainTextForMeta(
        `Полный каталог wellness-комплексов, фитопрепаратов, натурального ухода и eco-средств ${SITE_PRODUCT_BRAND} в интернет-магазине ${SITE_STORE_NAME}. Официальный представитель бренда — доставка по Украине.`,
        168
      ),
      keywords: `${SITE_STORE_NAME}, каталог, ${SITE_PRODUCT_BRAND}, wellness, фитокомплексы, eco, купить, Украина`,
    };
  }

  return {
    h1: "Каталог",
    title: `Каталог ${SITE_PRODUCT_BRAND}: wellness та eco | ${SITE_STORE_NAME}`,
    ogTitle: `Каталог продукції ${SITE_PRODUCT_BRAND} | ${SITE_STORE_NAME}`,
    description: plainTextForMeta(
      `Повний каталог wellness-комплексів, фітопрепаратів, натурального догляду та eco-засобів ${SITE_PRODUCT_BRAND} в інтернет-магазині ${SITE_STORE_NAME}. Офіційний представник бренду — доставка по Україні.`,
      168
    ),
    keywords: `${SITE_STORE_NAME}, каталог, ${SITE_PRODUCT_BRAND}, wellness, фітокомплекси, eco, купити, Україна`,
  };
}

/** Product page SEO title/description. */
export function productSeoCopy(
  locale: Locale,
  product: {
    name: string;
    description?: string | null;
    category_name?: string | null;
    price?: number;
    discount_percentage?: number | null;
  },
  priceLabel?: string
): { title: string; description: string; keywords: string[] } {
  const category =
    product.category_name ||
    (locale === "ru" ? "wellness" : "wellness");
  const priceBit = priceLabel ? ` ${priceLabel} ₴.` : "";
  const raw = plainTextForMeta(product.description, 120);

  if (locale === "ru") {
    const fallback = `${product.name} — оригинальная продукция ${SITE_PRODUCT_BRAND} в ${SITE_STORE_NAME}, категория «${category}».${priceBit} Доставка по Украине.`;
    return {
      title: `${product.name} купить | ${SITE_STORE_NAME}`,
      description: raw
        ? plainTextForMeta(
            `${raw} Купить ${product.name} в ${SITE_STORE_NAME} — официальный представитель ${SITE_PRODUCT_BRAND}.${priceBit}`,
            168
          )
        : plainTextForMeta(fallback, 168),
      keywords: [
        product.name,
        `купить ${product.name}`,
        SITE_PRODUCT_BRAND,
        SITE_STORE_NAME,
        category,
        "wellness",
        "Украина",
      ],
    };
  }

  const fallback = `${product.name} — оригінальна продукція ${SITE_PRODUCT_BRAND} у ${SITE_STORE_NAME}, категорія «${category}».${priceBit} Доставка по Україні.`;
  return {
    title: `${product.name} купити | ${SITE_STORE_NAME}`,
    description: raw
      ? plainTextForMeta(
          `${raw} Купити ${product.name} у ${SITE_STORE_NAME} — офіційний представник ${SITE_PRODUCT_BRAND}.${priceBit}`,
          168
        )
      : plainTextForMeta(fallback, 168),
    keywords: [
      product.name,
      `купити ${product.name}`,
      SITE_PRODUCT_BRAND,
      SITE_STORE_NAME,
      category,
      "wellness",
      "Україна",
    ],
  };
}

/** Sitemap language alternates for a bare path. */
export function sitemapLanguageAlternates(path: string): {
  languages: Record<string, string>;
} {
  return { languages: hreflangAlternates(path) };
}
