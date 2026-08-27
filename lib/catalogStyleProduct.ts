import type { CatalogStyleProduct } from "@/components/product/CatalogStyleProductCard";

export function toCatalogStyleProduct(product: object): CatalogStyleProduct {
  const p = product as Record<string, unknown>;
  return {
    id: p.id as number,
    name: p.name as string,
    slug: (p.slug as string | null | undefined) ?? null,
    price: Number(p.price),
    old_price: (p.old_price as number | null | undefined) ?? null,
    discount_percentage:
      (p.discount_percentage as number | null | undefined) ?? null,
    description: (p.description as string | null | undefined) ?? null,
    first_media:
      (p.first_media as CatalogStyleProduct["first_media"]) ?? null,
    in_stock: p.in_stock as boolean | undefined,
    stock: p.stock as number | undefined,
    is_hit: p.is_hit as boolean | undefined,
    is_promo: p.is_promo as boolean | undefined,
    dietitian_approved: p.dietitian_approved as boolean | undefined,
    free_delivery_badge: p.free_delivery_badge as boolean | undefined,
    doctor_choice_badge: p.doctor_choice_badge as boolean | undefined,
    package_weight: (p.package_weight as string | null | undefined) ?? null,
    course: (p.course as string | null | undefined) ?? null,
    gift_product_id:
      (p.gift_product_id as number | null | undefined) ?? null,
    gift_product:
      (p.gift_product as CatalogStyleProduct["gift_product"]) ?? null,
  };
}
