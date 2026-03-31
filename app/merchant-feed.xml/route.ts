import { prisma } from "@/lib/prisma";

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

export async function GET() {
  const baseUrlRaw =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000";
  const baseUrl = normalizeBaseUrl(baseUrlRaw);

  const products = await prisma.product.findMany({
    where: {
      inStock: true,
    },
    orderBy: { id: "desc" },
    include: {
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
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
      const productUrl = joinUrl(baseUrl, `/product/${productSlug}`);
      const mainPhoto = p.media.find((m) => m.type === "photo") ?? p.media[0];
      const imageUrl = mainPhoto?.url
        ? mainPhoto.url.startsWith("http")
          ? mainPhoto.url
          : joinUrl(baseUrl, `/api/images/${mainPhoto.url}`)
        : joinUrl(baseUrl, "/images/tg_image_3614117882.png");
      const additionalImages = p.media
        .filter((m) => m.url !== mainPhoto?.url)
        .slice(0, 10)
        .map((m) => (m.url.startsWith("http") ? m.url : joinUrl(baseUrl, `/api/images/${m.url}`)));

      const hasDiscount = Number(p.discountPercentage ?? 0) > 0;
      const basePrice = Number(p.price ?? 0);
      const salePrice = hasDiscount
        ? basePrice * (1 - Number(p.discountPercentage) / 100)
        : null;
      const availability =
        p.inStock && Number(p.stock ?? 0) > 0 ? "in stock" : "out of stock";
      const categoryParts = [p.category?.name, p.subcategory?.name].filter(Boolean) as string[];
      const productType = categoryParts.join(" > ");
      const formAndCourse = [p.releaseForm, p.course].filter(Boolean).join(" | ");
      const mainInfoText = p.mainInfo ? stripHtml(String(p.mainInfo)) : "";
      const descriptionText = p.description ? stripHtml(String(p.description)) : "";
      const description = (mainInfoText || descriptionText || p.name).slice(0, 4500);
      const salePriceEffective = salePrice !== null && salePrice < basePrice ? salePrice : null;
      const gAvailability = availability === "in stock" ? "in_stock" : "out_of_stock";

      const detailsXml = [
        formAndCourse
          ? `<g:product_detail><g:section_name>Опис</g:section_name><g:attribute_name>Форма випуску / Курс</g:attribute_name><g:attribute_value>${escapeXml(
              stripHtml(formAndCourse).slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
        mainInfoText
          ? `<g:product_detail><g:section_name>Опис</g:section_name><g:attribute_name>Основна інформація</g:attribute_name><g:attribute_value>${escapeXml(
              mainInfoText.slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
        descriptionText
          ? `<g:product_detail><g:section_name>Опис</g:section_name><g:attribute_name>Опис</g:attribute_name><g:attribute_value>${escapeXml(
              descriptionText.slice(0, 1000)
            )}</g:attribute_value></g:product_detail>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return [
        "<item>",
        `<g:id>${p.id}</g:id>`,
        `<g:title>${escapeXml(p.name)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        detailsXml,
        `<g:link>${escapeXml(productUrl)}</g:link>`,
        `<g:image_link>${escapeXml(imageUrl)}</g:image_link>`,
        `<g:availability>${gAvailability}</g:availability>`,
        "<g:condition>new</g:condition>",
        "<g:brand>Forbody Space</g:brand>",
        `<g:price>${formatPriceUAH(basePrice)}</g:price>`,
        salePriceEffective !== null ? `<g:sale_price>${formatPriceUAH(salePriceEffective)}</g:sale_price>` : "",
        productType ? `<g:product_type>${escapeXml(productType)}</g:product_type>` : "",
        ...additionalImages.map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`),
        "<g:identifier_exists>no</g:identifier_exists>",
        "<g:adult>no</g:adult>",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Forbody Space Product Feed</title>
<link>${escapeXml(baseUrl)}</link>
<description>Google Merchant Center feed for Forbody Space</description>
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
