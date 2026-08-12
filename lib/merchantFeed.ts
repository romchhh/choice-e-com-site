import { prisma } from "@/lib/prisma";
import { type Locale } from "@/lib/i18n/config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatPriceUAH(value: number): string {
  return `${value.toFixed(2)} UAH`;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function joinUrl(base: string, path: string): string {
  const safeBase = normalizeBaseUrl(base);
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${safeBase}${safePath}`;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function pickRu(
  ua: string | null | undefined,
  ru: string | null | undefined,
  locale: Locale
): string {
  if (locale === "ru" && ru != null && String(ru).trim() !== "") return String(ru);
  return String(ua ?? "");
}

/** Google Merchant RSS feed (uk or ru). */
export async function buildMerchantFeed(locale: Locale): Promise<Response> {
  const baseUrlRaw =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000";
  const baseUrl = normalizeBaseUrl(baseUrlRaw);
  const isRu = locale === "ru";

  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { id: "desc" },
    include: {
      category: { select: { name: true, nameRu: true } },
      subcategory: { select: { name: true, nameRu: true } },
      media: {
        orderBy: { id: "asc" },
        select: { url: true, type: true },
      },
    },
  });

  const itemsXml = products
    .filter((p) => p && p.id && p.name && Number(p.price) > 0)
    .map((p) => {
      const productSlug = p.slug ?? String(p.id);
      const productPath = isRu ? `/ru/product/${productSlug}` : `/product/${productSlug}`;
      const productUrl = joinUrl(baseUrl, productPath);
      const title =
        pickRu(p.name, (p as { nameRu?: string | null }).nameRu, locale) || p.name;
      const mainPhoto = p.media.find((m) => m.type === "photo") ?? p.media[0];
      const imageUrl = mainPhoto?.url
        ? mainPhoto.url.startsWith("http")
          ? mainPhoto.url
          : joinUrl(baseUrl, `/api/images/${mainPhoto.url}`)
        : joinUrl(baseUrl, "/images/tg_image_3614117882.png");
      const additionalImages = p.media
        .filter((m) => m.url !== mainPhoto?.url)
        .slice(0, 10)
        .map((m) =>
          m.url.startsWith("http") ? m.url : joinUrl(baseUrl, `/api/images/${m.url}`)
        );

      const hasDiscount = Number(p.discountPercentage ?? 0) > 0;
      const basePrice = Number(p.price ?? 0);
      const salePrice = hasDiscount
        ? basePrice * (1 - Number(p.discountPercentage) / 100)
        : null;
      const availability =
        p.inStock && Number(p.stock ?? 0) > 0 ? "in stock" : "out of stock";
      const categoryName = pickRu(
        p.category?.name,
        (p.category as { nameRu?: string | null } | null)?.nameRu,
        locale
      );
      const subcategoryName = pickRu(
        p.subcategory?.name,
        (p.subcategory as { nameRu?: string | null } | null)?.nameRu,
        locale
      );
      const productType = [categoryName, subcategoryName].filter(Boolean).join(" > ");
      const releaseForm = pickRu(
        p.releaseForm,
        (p as { releaseFormRu?: string | null }).releaseFormRu,
        locale
      );
      const course = pickRu(p.course, (p as { courseRu?: string | null }).courseRu, locale);
      const formAndCourse = [releaseForm, course].filter(Boolean).join(" | ");
      const mainInfoRaw = pickRu(
        p.mainInfo,
        (p as { mainInfoRu?: string | null }).mainInfoRu,
        locale
      );
      const descriptionRaw = pickRu(
        p.description,
        (p as { descriptionRu?: string | null }).descriptionRu,
        locale
      );
      const mainInfoText = mainInfoRaw ? stripHtml(mainInfoRaw) : "";
      const descriptionText = descriptionRaw ? stripHtml(descriptionRaw) : "";
      const description = (mainInfoText || descriptionText || title).slice(0, 4500);
      const salePriceEffective =
        salePrice !== null && salePrice < basePrice ? salePrice : null;
      const gAvailability = availability === "in stock" ? "in_stock" : "out_of_stock";

      const sectionName = isRu ? "Описание" : "Опис";
      const attrForm = isRu ? "Форма выпуска / Курс" : "Форма випуску / Курс";
      const attrMain = isRu ? "Основная информация" : "Основна інформація";
      const attrDesc = isRu ? "Описание" : "Опис";

      const detailsXml = [
        formAndCourse
          ? `<g:product_detail><g:section_name>${sectionName}</g:section_name><g:attribute_name>${attrForm}</g:attribute_name><g:attribute_value>${escapeXml(
              stripHtml(formAndCourse).slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
        mainInfoText
          ? `<g:product_detail><g:section_name>${sectionName}</g:section_name><g:attribute_name>${attrMain}</g:attribute_name><g:attribute_value>${escapeXml(
              mainInfoText.slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
        descriptionText
          ? `<g:product_detail><g:section_name>${sectionName}</g:section_name><g:attribute_name>${attrDesc}</g:attribute_name><g:attribute_value>${escapeXml(
              descriptionText.slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return [
        "<item>",
        `<g:id>${isRu ? `ru-${p.id}` : p.id}</g:id>`,
        `<g:title>${escapeXml(title)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        detailsXml,
        `<g:link>${escapeXml(productUrl)}</g:link>`,
        `<g:image_link>${escapeXml(imageUrl)}</g:image_link>`,
        `<g:availability>${gAvailability}</g:availability>`,
        "<g:condition>new</g:condition>",
        "<g:brand>Forbody Space</g:brand>",
        `<g:price>${formatPriceUAH(basePrice)}</g:price>`,
        salePriceEffective !== null
          ? `<g:sale_price>${formatPriceUAH(salePriceEffective)}</g:sale_price>`
          : "",
        productType ? `<g:product_type>${escapeXml(productType)}</g:product_type>` : "",
        ...additionalImages.map(
          (img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
        ),
        "<g:identifier_exists>no</g:identifier_exists>",
        "<g:adult>no</g:adult>",
        isRu ? "<g:language>ru</g:language>" : "<g:language>uk</g:language>",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const channelTitle = isRu
    ? "ForBody Space — товарный фид (RU)"
    : "ForBody Space Product Feed";
  const channelDesc = isRu
    ? "Google Merchant Center feed (русский) для ForBody Space"
    : "Google Merchant Center feed for ForBody Space";
  const channelLink = isRu ? joinUrl(baseUrl, "/ru") : baseUrl;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${escapeXml(channelTitle)}</title>
<link>${escapeXml(channelLink)}</link>
<description>${escapeXml(channelDesc)}</description>
${itemsXml}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
