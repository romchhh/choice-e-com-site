import { sqlGetAllProducts } from "@/lib/sql";

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

export async function GET() {
  const baseUrl =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000";

  const products = await sqlGetAllProducts();

  const itemsXml = products
    .filter((p) => p && p.id && p.name)
    .map((p) => {
      const productUrl = `${baseUrl}/product/${p.slug ?? p.id}`;
      const imageUrl = p.first_media?.url
        ? p.first_media.url.startsWith("http")
          ? p.first_media.url
          : `${baseUrl}/api/images/${p.first_media.url}`
        : `${baseUrl}/images/tg_image_3614117882.png`;

      const hasDiscount = Number(p.discount_percentage ?? 0) > 0;
      const basePrice = Number(p.price ?? 0);
      const salePrice = hasDiscount
        ? basePrice * (1 - Number(p.discount_percentage) / 100)
        : null;
      const availability = p.in_stock && Number(p.stock ?? 0) > 0 ? "in stock" : "out of stock";
      const description = (p.description || p.name || "").slice(0, 4500);

      return [
        "<item>",
        `<g:id>${p.id}</g:id>`,
        `<g:title>${escapeXml(p.name)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        `<g:link>${escapeXml(productUrl)}</g:link>`,
        `<g:image_link>${escapeXml(imageUrl)}</g:image_link>`,
        `<g:availability>${availability}</g:availability>`,
        "<g:condition>new</g:condition>",
        "<g:brand>Forbody Space</g:brand>",
        `<g:price>${formatPriceUAH(basePrice)}</g:price>`,
        salePrice !== null ? `<g:sale_price>${formatPriceUAH(salePrice)}</g:sale_price>` : "",
        p.category_name ? `<g:product_type>${escapeXml(p.category_name)}</g:product_type>` : "",
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
