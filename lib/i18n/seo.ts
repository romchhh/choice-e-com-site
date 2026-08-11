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
  categoryName?: string | null
): { title: string; description: string; keywords: string } {
  if (categoryName) {
    if (locale === "ru") {
      return {
        title: `${categoryName} — каталог | ${SITE_STORE_NAME}`,
        description: `Купить «${categoryName}» в интернет-магазине ${SITE_STORE_NAME}. Оригинальная продукция ${SITE_PRODUCT_BRAND}: wellness-комплексы и eco-средства с доставкой по Украине.`,
        keywords: `${categoryName}, ${SITE_STORE_NAME}, ${SITE_PRODUCT_BRAND}, wellness, фитокомплексы, купить, Украина`,
      };
    }
    return {
      title: `${categoryName} — каталог | ${SITE_STORE_NAME}`,
      description: `Купити «${categoryName}» в інтернет-магазині ${SITE_STORE_NAME}. Оригінальна продукція ${SITE_PRODUCT_BRAND}: wellness-комплекси та eco-засоби з доставкою по Україні.`,
      keywords: `${categoryName}, ${SITE_STORE_NAME}, ${SITE_PRODUCT_BRAND}, wellness, фітокомплекси, купити, Україна`,
    };
  }

  if (locale === "ru") {
    return {
      title: `Каталог wellness и eco-продукции | ${SITE_STORE_NAME}`,
      description: `Полный каталог wellness-комплексов, фитопрепаратов, натурального ухода и eco-средств ${SITE_PRODUCT_BRAND} в ${SITE_STORE_NAME}. Подберите программу для здоровья и дома.`,
      keywords: `${SITE_STORE_NAME}, каталог, ${SITE_PRODUCT_BRAND}, wellness, фитокомплексы, eco, купить`,
    };
  }

  return {
    title: `Каталог wellness та eco-продукції | ${SITE_STORE_NAME}`,
    description: `Повний каталог wellness-комплексів, фітопрепаратів, натурального догляду та eco-засобів ${SITE_PRODUCT_BRAND} у ${SITE_STORE_NAME}. Підберіть програму для здоров'я і дому.`,
    keywords: `${SITE_STORE_NAME}, каталог, ${SITE_PRODUCT_BRAND}, wellness, фітокомплекси, eco, купити`,
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
