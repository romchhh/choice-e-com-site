import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { unlink } from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";
import { textToSlug, ensureUniqueSlug } from "./slug";
import { normalizeProductPricing, parseOptionalNumber } from "./pricing";
import { scheduleProductRuSync, scheduleCategoryRuSync, scheduleSubcategoryRuSync } from "./translate/catalogRu";

function formatProductPricing(
  price: unknown,
  oldPrice: unknown,
  discountPercentage: unknown
) {
  return normalizeProductPricing(
    Number(price),
    parseOptionalNumber(oldPrice),
    parseOptionalNumber(discountPercentage)
  );
}

/** Raw RU fields for client-side / server-side locale overlay */
function productRuApiFields(p: any) {
  return {
    name_ru: p.nameRu ?? null,
    subtitle_ru: p.subtitleRu ?? null,
    release_form_ru: p.releaseFormRu ?? null,
    course_ru: p.courseRu ?? null,
    package_weight_ru: p.packageWeightRu ?? null,
    main_info_ru: p.mainInfoRu ?? null,
    short_description_ru: p.shortDescriptionRu ?? null,
    description_ru: p.descriptionRu ?? null,
    main_action_ru: p.mainActionRu ?? null,
    indications_for_use_ru: p.indicationsForUseRu ?? null,
    benefits_ru: p.benefitsRu ?? null,
    full_composition_ru: p.fullCompositionRu ?? null,
    usage_method_ru: p.usageMethodRu ?? null,
    contraindications_ru: p.contraindicationsRu ?? null,
    storage_conditions_ru: p.storageConditionsRu ?? null,
    fabric_composition_ru: p.fabricCompositionRu ?? null,
    lining_description_ru: p.liningDescriptionRu ?? null,
    category_name_ru: p.category?.nameRu ?? null,
    category_description_ru: p.category?.descriptionRu ?? null,
    subcategory_name_ru: p.subcategory?.nameRu ?? null,
  };
}

// Keep sql template literal for backward compatibility (used in migrate route)
// This will be deprecated but kept for now
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : false,
});

export const sql = Object.assign(
  async (strings: TemplateStringsArray, ...values: unknown[]) => {
    let query = strings[0];
    for (let i = 0; i < values.length; i++) {
      query += `$${i + 1}` + strings[i + 1];
    }
    const result = await pool.query(query, values);
    return result.rows;
  },
  {
    query: async (strings: TemplateStringsArray, ...values: unknown[]) => {
      let query = strings[0];
      for (let i = 0; i < values.length; i++) {
        query += `$${i + 1}` + strings[i + 1];
      }
      const result = await pool.query(query, values);
      return result.rows;
    },
  }
);

// =====================
// 👕 PRODUCTS
// =====================

// Get all products - optimized for catalog list (only first photo)
async function _sqlGetAllProducts() {
  const products = (await prisma.product.findMany({
    orderBy: { id: "desc" },
    include: {
      category: {
        select: { name: true, nameRu: true },
      },
      subcategory: {
        select: { name: true, nameRu: true },
      },
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
      categoryLinks: {
        select: { categoryId: true },
      },
      subcategoryLinks: {
        select: { subcategoryId: true },
      },
    } as any,
  })) as any[];

  return products.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    description: p.description,
    ...formatProductPricing(p.price, p.oldPrice, p.discountPercentage),
    is_hit: p.isHit ?? false,
    dietitian_approved: p.dietitianApproved ?? false,
    is_promo: p.isPromo ?? false,
    free_delivery_badge: (p as any).freeDeliveryBadge ?? false,
    gift_product_id: p.giftProductId ?? null,
    category_id: p.categoryId,
    category_ids: Array.from(
      new Set([
        ...(((p as any).categoryLinks as { categoryId: number }[] | undefined)?.map(
          (cl) => cl.categoryId
        ) ?? []),
        ...(p.categoryId ? [p.categoryId] : []),
      ])
    ),
    subcategory_id: p.subcategoryId,
    subcategory_ids: Array.from(
      new Set([
        ...(((p as any).subcategoryLinks as { subcategoryId: number }[] | undefined)?.map(
          (sl) => sl.subcategoryId
        ) ?? []),
        ...(p.subcategoryId ? [p.subcategoryId] : []),
      ])
    ),
    stock: p.stock,
    in_stock: p.inStock,
    created_at: p.createdAt,
    category_name: p.category?.name || null,
    subcategory_name: p.subcategory?.name || null,
    package_weight: p.packageWeight ?? null,
    course: p.course ?? null,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
    ...productRuApiFields(p),
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetAllProducts = unstable_cache(
  _sqlGetAllProducts,
  ['all-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Get one product by ID with media and stock
export async function sqlGetProduct(id: number) {
  return unstable_cache(
    async () => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { name: true, nameRu: true, slug: true, description: true, descriptionRu: true } },
          subcategory: { select: { name: true, nameRu: true } },
          media: { orderBy: { id: "asc" }, select: { type: true, url: true } },
          categoryLinks: { select: { categoryId: true } },
          subcategoryLinks: { select: { subcategoryId: true } },
          giftProduct: {
            select: {
              id: true,
              name: true,
              nameRu: true,
              slug: true,
              price: true,
              oldPrice: true,
              discountPercentage: true,
              media: { take: 1, orderBy: { id: "asc" }, select: { type: true, url: true } },
            },
          },
        } as any,
      });

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug ?? null,
        subtitle: product.subtitle ?? null,
        release_form: product.releaseForm ?? null,
        course: product.course ?? null,
        package_weight: product.packageWeight ?? null,
        main_info: product.mainInfo ?? null,
        short_description: product.shortDescription ?? null,
        description: product.description ?? null,
        main_action: product.mainAction ?? null,
        indications_for_use: product.indicationsForUse ?? null,
        benefits: product.benefits ?? null,
        full_composition: product.fullComposition ?? null,
        usage_method: product.usageMethod ?? null,
        contraindications: product.contraindications ?? null,
        storage_conditions: product.storageConditions ?? null,
        ...formatProductPricing(
          product.price,
          product.oldPrice,
          product.discountPercentage
        ),
        priority: product.priority,
        top_sale: product.topSale,
        in_stock: product.inStock,
        limited_edition: product.limitedEdition,
        is_hit: (product as any).isHit ?? false,
        dietitian_approved: (product as any).dietitianApproved ?? false,
        is_promo: (product as any).isPromo ?? false,
        free_delivery_badge: (product as any).freeDeliveryBadge ?? false,
        stock: product.stock,
        category_id: product.categoryId,
        category_ids: Array.from(
          new Set([
            ...(((product as any).categoryLinks as { categoryId: number }[] | undefined)?.map(
              (cl) => cl.categoryId
            ) ?? []),
            ...(product.categoryId ? [product.categoryId] : []),
          ])
        ),
        subcategory_id: product.subcategoryId,
        subcategory_ids: Array.from(
          new Set([
            ...(((product as any).subcategoryLinks as { subcategoryId: number }[] | undefined)?.map(
              (sl) => sl.subcategoryId
            ) ?? []),
            ...(product.subcategoryId ? [product.subcategoryId] : []),
          ])
        ),
        fabric_composition: (product as any).fabricComposition ?? null,
        has_lining: (product as any).hasLining,
        lining_description: (product as any).liningDescription ?? null,
        category_name: (product as any).category?.name || null,
        category_slug: (product as any).category?.slug ?? null,
        category_description: (product as any).category?.description ?? null,
        subcategory_name: (product as any).subcategory?.name || null,
        media: ((product as any).media as { type: string; url: string }[]).map(
          (m) => ({ type: m.type, url: m.url })
        ),
        gift_product: (product as any).giftProduct
          ? {
              id: (product as any).giftProduct.id,
              name: (product as any).giftProduct.name,
              name_ru: (product as any).giftProduct.nameRu ?? null,
              slug: (product as any).giftProduct.slug ?? null,
              price: Number((product as any).giftProduct.price),
              old_price: (product as any).giftProduct.oldPrice ? Number((product as any).giftProduct.oldPrice) : null,
              discount_percentage: (product as any).giftProduct.discountPercentage ?? null,
              first_media: (product as any).giftProduct.media?.[0]
                ? { type: (product as any).giftProduct.media[0].type, url: (product as any).giftProduct.media[0].url }
                : null,
            }
          : null,
        bought_together_ids: (product as any).boughtTogetherIds ?? [],
        pair_together_ids: (product as any).pairTogetherIds ?? [],
        ...productRuApiFields(product),
      };
    },
    [`product-${id}`],
    { revalidate: 1200, tags: ['products', `product-${id}`] }
  )();
}

// Get one product by slug (ЧПУ)
export async function sqlGetProductBySlug(slug: string) {
  const product = (await prisma.product.findUnique({
    where: { slug: slug || undefined },
    include: {
      category: { select: { name: true, nameRu: true, slug: true, description: true, descriptionRu: true } },
      subcategory: { select: { name: true, nameRu: true } },
      media: { orderBy: { id: "asc" }, select: { type: true, url: true } },
      categoryLinks: { select: { categoryId: true } },
      subcategoryLinks: { select: { subcategoryId: true } },
      giftProduct: {
        select: {
          id: true,
          name: true,
          nameRu: true,
          slug: true,
          price: true,
          oldPrice: true,
          discountPercentage: true,
          media: { take: 1, orderBy: { id: "asc" }, select: { type: true, url: true } },
        },
      },
    } as any,
  })) as any;
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? null,
    subtitle: product.subtitle ?? null,
    release_form: product.releaseForm ?? null,
    course: product.course ?? null,
    package_weight: product.packageWeight ?? null,
    main_info: product.mainInfo ?? null,
    short_description: product.shortDescription ?? null,
    description: product.description ?? null,
    main_action: product.mainAction ?? null,
    indications_for_use: product.indicationsForUse ?? null,
    benefits: product.benefits ?? null,
    full_composition: product.fullComposition ?? null,
    usage_method: product.usageMethod ?? null,
    contraindications: product.contraindications ?? null,
    storage_conditions: product.storageConditions ?? null,
    ...formatProductPricing(
      product.price,
      product.oldPrice,
      product.discountPercentage
    ),
    priority: product.priority,
    top_sale: product.topSale,
    in_stock: product.inStock,
    limited_edition: product.limitedEdition,
    is_hit: product.isHit ?? false,
    dietitian_approved: product.dietitianApproved ?? false,
    is_promo: product.isPromo ?? false,
    free_delivery_badge: (product as any).freeDeliveryBadge ?? false,
    stock: product.stock,
    category_id: product.categoryId,
    category_ids: Array.from(
      new Set([
        ...(((product as any).categoryLinks as { categoryId: number }[] | undefined)?.map(
          (cl) => cl.categoryId
        ) ?? []),
        ...(product.categoryId ? [product.categoryId] : []),
      ])
    ),
    subcategory_id: product.subcategoryId,
    subcategory_ids: Array.from(
      new Set([
        ...(((product as any).subcategoryLinks as { subcategoryId: number }[] | undefined)?.map(
          (sl) => sl.subcategoryId
        ) ?? []),
        ...(product.subcategoryId ? [product.subcategoryId] : []),
      ])
    ),
    fabric_composition: product.fabricComposition ?? null,
    has_lining: product.hasLining,
    lining_description: product.liningDescription ?? null,
    category_name: product.category?.name || null,
    subcategory_name: product.subcategory?.name || null,
    category_slug: product.category?.slug ?? null,
    category_description: product.category?.description ?? null,
    media: product.media.map((m: any) => ({ type: m.type, url: m.url })),
    gift_product: product.giftProduct
      ? {
          id: product.giftProduct.id,
          name: product.giftProduct.name,
          name_ru: (product.giftProduct as { nameRu?: string | null }).nameRu ?? null,
          slug: product.giftProduct.slug ?? null,
          price: Number(product.giftProduct.price),
          old_price: product.giftProduct.oldPrice ? Number(product.giftProduct.oldPrice) : null,
          discount_percentage: product.giftProduct.discountPercentage ?? null,
          first_media: product.giftProduct.media?.[0]
            ? { type: product.giftProduct.media[0].type, url: product.giftProduct.media[0].url }
            : null,
        }
      : null,
    bought_together_ids: product.boughtTogetherIds ?? [],
    pair_together_ids: product.pairTogetherIds ?? [],
    ...productRuApiFields(product),
  };
}

// Get products by category name
export async function sqlGetProductsByCategory(categoryName: string) {
  return unstable_cache(
    async () => {
      const products = (await prisma.product.findMany({
        where: {
          OR: [
            {
              category: {
                name: categoryName,
              },
            },
            {
              categoryLinks: {
                some: {
                  category: {
                    name: categoryName,
                  },
                },
              },
            },
          ],
        } as any,
        orderBy: { id: "desc" },
        include: {
          category: {
            select: { name: true, nameRu: true },
          },
          subcategory: {
            select: { name: true, nameRu: true },
          },
          categoryLinks: {
            select: { categoryId: true },
          },
          media: {
            take: 1,
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
        } as any,
      })) as any[];

      return products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug ?? null,
        description: p.description ?? null,
        ...formatProductPricing(p.price, p.oldPrice, p.discountPercentage),
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
        is_hit: p.isHit ?? false,
        dietitian_approved: p.dietitianApproved ?? false,
        is_promo: p.isPromo ?? false,
        free_delivery_badge: (p as any).freeDeliveryBadge ?? false,
        gift_product_id: p.giftProductId ?? null,
        category_id: p.categoryId,
        subcategory_id: p.subcategoryId,
        category_ids: Array.from(
          new Set([
            ...(((p as any).categoryLinks as { categoryId: number }[] | undefined)?.map(
              (cl) => cl.categoryId
            ) ?? []),
            ...(p.categoryId ? [p.categoryId] : []),
          ])
        ),
        stock: p.stock,
        in_stock: p.inStock,
        category_name: p.category?.name || null,
        subcategory_name: p.subcategory?.name || null,
        package_weight: p.packageWeight ?? null,
        course: p.course ?? null,
        first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
        ...productRuApiFields(p),
      }));
    },
    [`products-by-category-${categoryName}`],
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `category-${categoryName}`],
    }
  )();
}

// Get products by subcategory name
export async function sqlGetProductsBySubcategoryName(name: string) {
  return unstable_cache(
    async () => {
      const products = (await prisma.product.findMany({
        where: {
          OR: [
            {
              subcategory: {
                name: {
                  equals: name,
                  mode: "insensitive",
                },
              },
            },
            {
              subcategoryLinks: {
                some: {
                  subcategory: {
                    name: {
                      equals: name,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        } as any,
        orderBy: { id: "desc" },
        include: {
          category: {
            select: { name: true, nameRu: true },
          },
          subcategory: {
            select: { name: true, nameRu: true },
          },
          categoryLinks: {
            select: { categoryId: true },
          },
          subcategoryLinks: {
            select: { subcategoryId: true },
          },
          media: {
            take: 1,
            orderBy: { id: "asc" },
            select: {
              type: true,
              url: true,
            },
          },
        } as any,
      })) as any[];

      return products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug ?? null,
        description: p.description ?? null,
        ...formatProductPricing(p.price, p.oldPrice, p.discountPercentage),
        top_sale: p.topSale,
        limited_edition: p.limitedEdition,
        is_hit: p.isHit ?? false,
        dietitian_approved: p.dietitianApproved ?? false,
        is_promo: p.isPromo ?? false,
        free_delivery_badge: (p as any).freeDeliveryBadge ?? false,
        gift_product_id: p.giftProductId ?? null,
        category_id: p.categoryId,
        subcategory_id: p.subcategoryId,
        category_ids: Array.from(
          new Set([
            ...(((p as any).categoryLinks as { categoryId: number }[] | undefined)?.map(
              (cl) => cl.categoryId
            ) ?? []),
            ...(p.categoryId ? [p.categoryId] : []),
          ])
        ),
        subcategory_ids: Array.from(
          new Set([
            ...(((p as any).subcategoryLinks as { subcategoryId: number }[] | undefined)?.map(
              (sl) => sl.subcategoryId
            ) ?? []),
            ...(p.subcategoryId ? [p.subcategoryId] : []),
          ])
        ),
        stock: p.stock,
        in_stock: p.inStock,
        category_name: p.category?.name || null,
        subcategory_name: p.subcategory?.name || null,
        package_weight: p.packageWeight ?? null,
        course: p.course ?? null,
        first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
        ...productRuApiFields(p),
      }));
    },
    [`products-by-subcategory-${name}`],
    {
      revalidate: 1200, // 20 minutes
      tags: ['products', `subcategory-${name}`],
    }
  )();
}

// Get only top sale products
async function _sqlGetTopSaleProducts() {
  const products = await prisma.product.findMany({
    where: { topSale: true },
    orderBy: { id: "desc" },
    include: {
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    ...formatProductPricing(p.price, p.oldPrice, p.discountPercentage),
    top_sale: p.topSale,
    limited_edition: p.limitedEdition,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
    ...productRuApiFields(p),
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetTopSaleProducts = unstable_cache(
  _sqlGetTopSaleProducts,
  ['top-sale-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Get only limited edition products
async function _sqlGetLimitedEditionProducts() {
  const products = await prisma.product.findMany({
    where: { limitedEdition: true },
    orderBy: { id: "desc" },
    include: {
      media: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          type: true,
          url: true,
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    ...formatProductPricing(p.price, p.oldPrice, p.discountPercentage),
    top_sale: p.topSale,
    limited_edition: p.limitedEdition,
    first_media: p.media[0] ? { type: p.media[0].type, url: p.media[0].url } : null,
    ...productRuApiFields(p),
  }));
}

// Cached version with 20 minute revalidation
export const sqlGetLimitedEditionProducts = unstable_cache(
  _sqlGetLimitedEditionProducts,
  ['limited-edition-products'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['products'],
  }
);

// Create new product
export async function sqlPostProduct(product: {
  name: string;
  subtitle?: string | null;
  release_form?: string | null;
  course?: string | null;
  package_weight?: string | null;
  main_info?: string | null;
  short_description?: string | null;
  description?: string | null;
  main_action?: string | null;
  indications_for_use?: string | null;
  benefits?: string | null;
  full_composition?: string | null;
  usage_method?: string | null;
  contraindications?: string | null;
  storage_conditions?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  priority?: number;
  top_sale?: boolean;
  in_stock?: boolean;
  limited_edition?: boolean;
  is_hit?: boolean;
  dietitian_approved?: boolean;
  is_promo?: boolean;
  free_delivery_badge?: boolean;
  gift_product_id?: number | null;
  bought_together_ids?: number[];
  pair_together_ids?: number[];
  stock?: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  fabric_composition?: string | null;
  has_lining?: boolean;
  lining_description?: string | null;
  media?: { type: string; url: string }[];
  category_ids?: number[];
  subcategory_ids?: number[];
}) {
  const baseSlug = textToSlug(product.name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.product.findFirst({ where: { slug: s } }).then(Boolean)
  );

  const pricing = normalizeProductPricing(
    product.price,
    product.old_price,
    product.discount_percentage
  );

  const created = await prisma.product.create({
    data: {
      name: product.name,
      slug,
      subtitle: product.subtitle ?? null,
      releaseForm: product.release_form ?? null,
      course: product.course ?? null,
      packageWeight: product.package_weight ?? null,
      mainInfo: product.main_info ?? null,
      shortDescription: product.short_description ?? null,
      description: product.description ?? null,
      mainAction: product.main_action ?? null,
      indicationsForUse: product.indications_for_use ?? null,
      benefits: product.benefits ?? null,
      fullComposition: product.full_composition ?? null,
      usageMethod: product.usage_method ?? null,
      contraindications: product.contraindications ?? null,
      storageConditions: product.storage_conditions ?? null,
      price: pricing.price,
      oldPrice: pricing.old_price,
      discountPercentage: pricing.discount_percentage,
      priority: product.priority ?? 0,
      topSale: product.top_sale ?? false,
      inStock: product.in_stock ?? true,
      limitedEdition: product.limited_edition ?? false,
      isHit: product.is_hit ?? false,
      dietitianApproved: product.dietitian_approved ?? false,
      isPromo: product.is_promo ?? false,
      freeDeliveryBadge: product.free_delivery_badge ?? false,
      giftProductId: product.gift_product_id ?? null,
      boughtTogetherIds: product.bought_together_ids ?? [],
      pairTogetherIds: product.pair_together_ids ?? [],
      stock: product.stock ?? 0,
      categoryId: product.category_id ?? null,
      subcategoryId: product.subcategory_id ?? null,
      fabricComposition: product.fabric_composition ?? null,
      hasLining: product.has_lining ?? false,
      liningDescription: product.lining_description ?? null,
      media: product.media?.length
        ? { create: product.media.map((m) => ({ type: m.type, url: m.url })) }
        : undefined,
    },
  });

  // Створюємо зв’язки товар–категорії (включно з основною категорією)
  const allCategoryIds = Array.from(
    new Set([
      ...(product.category_ids ?? []),
      ...(product.category_id != null ? [product.category_id] : []),
    ])
  );

  if (allCategoryIds.length) {
    await (prisma as any).productCategoryLink.createMany({
      data: allCategoryIds.map((categoryId) => ({
        productId: created.id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  // Створюємо зв’язки товар–підкатегорії (включно з основною підкатегорією)
  const allSubcategoryIds = Array.from(
    new Set([
      ...(product.subcategory_ids ?? []),
      ...(product.subcategory_id != null ? [product.subcategory_id] : []),
    ])
  );

  if (allSubcategoryIds.length) {
    await (prisma as any).productSubcategoryLink.createMany({
      data: allSubcategoryIds.map((subcategoryId) => ({
        productId: created.id,
        subcategoryId,
      })),
      skipDuplicates: true,
    });
  }

  scheduleProductRuSync(created.id, true);
  return { id: created.id };
}

// Update existing product
export async function sqlPutProduct(
  id: number,
  update: {
    name: string;
    subtitle?: string | null;
    release_form?: string | null;
    course?: string | null;
    package_weight?: string | null;
    main_info?: string | null;
    short_description?: string | null;
    description?: string | null;
    main_action?: string | null;
    indications_for_use?: string | null;
    benefits?: string | null;
    full_composition?: string | null;
    usage_method?: string | null;
    contraindications?: string | null;
    storage_conditions?: string | null;
    price: number;
    old_price?: number | null;
    discount_percentage?: number | null;
    priority?: number;
    top_sale?: boolean;
    in_stock?: boolean;
    limited_edition?: boolean;
    is_hit?: boolean;
    dietitian_approved?: boolean;
    is_promo?: boolean;
    free_delivery_badge?: boolean;
    gift_product_id?: number | null;
    bought_together_ids?: number[];
    pair_together_ids?: number[];
    stock?: number;
    category_id?: number | null;
    subcategory_id?: number | null;
    fabric_composition?: string | null;
    has_lining?: boolean;
    lining_description?: string | null;
    media?: { type: string; url: string }[];
    category_ids?: number[];
    subcategory_ids?: number[];
  }
) {
  const pricing = normalizeProductPricing(
    update.price,
    update.old_price,
    update.discount_percentage
  );
  update = {
    ...update,
    price: pricing.price,
    old_price: pricing.old_price,
    discount_percentage: pricing.discount_percentage,
  };

  const oldMedia = await prisma.productMedia.findMany({
    where: { productId: id },
    select: { url: true },
  });
  const oldMediaUrls = oldMedia.map((m) => m.url);
  const newMediaUrls = (update.media || []).map((m) => m.url);
  const filesToDelete = oldMediaUrls.filter(
    (oldUrl) => !newMediaUrls.includes(oldUrl)
  );

  await prisma.$transaction(async (tx) => {
    const slugData: { slug?: string } = {};
    const current = await tx.product.findUnique({ where: { id }, select: { name: true, slug: true } });
    if (current && (!current.slug || current.name !== update.name)) {
      const baseSlug = textToSlug(update.name);
      slugData.slug = await ensureUniqueSlug(baseSlug, (s) =>
        tx.product.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
      );
    }

    await tx.product.update({
      where: { id },
      data: {
        name: update.name,
        ...slugData,
        subtitle: update.subtitle ?? undefined,
        releaseForm: update.release_form ?? undefined,
        course: update.course ?? undefined,
        packageWeight: update.package_weight ?? undefined,
        mainInfo: update.main_info ?? undefined,
        shortDescription: update.short_description ?? undefined,
        description: update.description ?? undefined,
        mainAction: update.main_action ?? undefined,
        indicationsForUse: update.indications_for_use ?? undefined,
        benefits: update.benefits ?? undefined,
        fullComposition: update.full_composition ?? undefined,
        usageMethod: update.usage_method ?? undefined,
        contraindications: update.contraindications ?? undefined,
        storageConditions: update.storage_conditions ?? undefined,
        price: update.price,
        ...(update.old_price !== undefined ? { oldPrice: update.old_price } : {}),
        ...(update.discount_percentage !== undefined
          ? { discountPercentage: update.discount_percentage }
          : {}),
        priority: update.priority ?? undefined,
        topSale: update.top_sale ?? undefined,
        inStock: update.in_stock ?? undefined,
        limitedEdition: update.limited_edition === true ? true : update.limited_edition === false ? false : undefined,
        isHit: update.is_hit ?? undefined,
        dietitianApproved: update.dietitian_approved ?? undefined,
        isPromo: update.is_promo ?? undefined,
        freeDeliveryBadge: update.free_delivery_badge ?? undefined,
        giftProductId: update.gift_product_id === undefined ? undefined : update.gift_product_id,
        boughtTogetherIds: update.bought_together_ids ?? undefined,
        pairTogetherIds: update.pair_together_ids ?? undefined,
        stock: update.stock ?? undefined,
        // null має явно записуватись у БД; ?? undefined перетворював null на «не змінювати» і лишав старий categoryId
        categoryId:
          update.category_id === undefined ? undefined : update.category_id,
        subcategoryId:
          update.subcategory_id === undefined
            ? undefined
            : update.subcategory_id,
        fabricComposition: update.fabric_composition ?? undefined,
        hasLining: update.has_lining ?? undefined,
        liningDescription: update.lining_description ?? undefined,
      },
    });

    await tx.productMedia.deleteMany({ where: { productId: id } });

    if (update.media?.length) {
      await tx.productMedia.createMany({
        data: update.media.map((m) => ({
          productId: id,
          type: m.type,
          url: m.url,
        })),
      });
    }

    // Оновлюємо зв’язки товар–категорії
    const allCategoryIds = Array.from(
      new Set([
        ...(update.category_ids ?? []),
        ...(update.category_id != null ? [update.category_id] : []),
      ])
    );

    // Спочатку видаляємо старі зв’язки
    await (tx as any).productCategoryLink.deleteMany({
      where: { productId: id },
    });

    // Створюємо нові, якщо є що зберігати
    if (allCategoryIds.length) {
      await (tx as any).productCategoryLink.createMany({
        data: allCategoryIds.map((categoryId) => ({
          productId: id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // Оновлюємо зв’язки товар–підкатегорії
    const allSubcategoryIds = Array.from(
      new Set([
        ...(update.subcategory_ids ?? []),
        ...(update.subcategory_id != null ? [update.subcategory_id] : []),
      ])
    );

    // Спочатку видаляємо старі зв’язки з підкатегоріями
    await (tx as any).productSubcategoryLink.deleteMany({
      where: { productId: id },
    });

    // Створюємо нові, якщо є що зберігати
    if (allSubcategoryIds.length) {
      await (tx as any).productSubcategoryLink.createMany({
        data: allSubcategoryIds.map((subcategoryId) => ({
          productId: id,
          subcategoryId,
        })),
        skipDuplicates: true,
      });
    }
  });

  // Step 4: Delete unused image files from disk
  for (const url of filesToDelete) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
      console.log(`✓ Deleted unused file: ${url}`);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  scheduleProductRuSync(id, true);
  return { updated: true };
}

export async function sqlDeleteProduct(id: number) {
  // Step 1: Get media URLs
  const media = await prisma.productMedia.findMany({
    where: { productId: id },
    select: { url: true },
  });

  // Step 2: Відв’язати позиції замовлень (product_name вже збережено в order_items)
  await prisma.orderItem.updateMany({
    where: { productId: id },
    data: { productId: null },
  });

  // Step 3: Delete the product (cascade removes media)
  await prisma.product.delete({
    where: { id },
  });

  // Step 4: Delete files from disk
  for (const { url } of media) {
    const filePath = path.join(process.cwd(), "product-images", url);
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Failed to delete image: ${filePath}`, error);
    }
  }

  return { deleted: true };
}

// =====================
// 📬 ORDERS
// =====================

// Get all orders (without items for performance)
export async function sqlGetAllOrders() {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: "paid" },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    customer_name: o.customerName,
    phone_number: o.phoneNumber,
    email: o.email,
    delivery_method: o.deliveryMethod,
    city: o.city,
    post_office: o.postOffice,
    comment: o.comment,
    payment_type: o.paymentType,
    invoice_id: o.invoiceId,
    payment_status: o.paymentStatus,
    status: o.status,
    created_at: o.createdAt,
  }));
}

// Get order with items
export async function sqlGetOrder(id: number) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    email: order.email,
    delivery_method: order.deliveryMethod,
    city: order.city,
    post_office: order.postOffice,
    comment: order.comment,
    payment_type: order.paymentType,
    invoice_id: order.invoiceId,
    payment_status: order.paymentStatus,
    status: order.status,
    created_at: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      product_name: item.productName ?? item.product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
      color: item.color,
    })),
  };
}

type OrderInput = {
  user_id?: string | null;
  customer_name: string;
  phone_number: string;
  email?: string;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string;
  payment_type: "prepay" | "full" | "pay_after" | "test_payment" | "installment" | "crypto";
  invoice_id: string;
  payment_status: "pending" | "paid" | "canceled";
  bonus_points_spent?: number;
  loyalty_discount_amount?: number;
  promo_code_id?: number | null;
  promo_discount_amount?: number | null;
  items: {
    product_id: number;
    product_name?: string | null;
    size: string;
    quantity: number;
    price: number;
    color?: string | null;
  }[];
  /** Після створення замовлення зменшити залишок на складі (накладений платіж без онлайн-оплати тощо). */
  decrement_stock?: boolean;
};

export async function sqlPostOrder(order: OrderInput) {
  // Transaction: create order and insert items. Використовуємо raw INSERT, щоб не залежати від колонок
  // bonus_points_spent та loyalty_discount_amount, яких може не бути в БД до застосування міграцій.
  return await prisma.$transaction(async (tx) => {
    let rows: [{ id: number }];
    try {
      rows = await tx.$queryRaw<[{ id: number }]>`
        INSERT INTO orders (customer_name, phone_number, email, delivery_method, city, post_office, comment, payment_type, invoice_id, payment_status, user_id)
        VALUES (${order.customer_name}, ${order.phone_number}, ${order.email ?? null}, ${order.delivery_method}, ${order.city}, ${order.post_office}, ${order.comment ?? null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status}, ${order.user_id ?? null})
        RETURNING id
      `;
    } catch (err) {
      const msg = String((err as Error).message ?? "");
      if (msg.includes("user_id") && msg.includes("does not exist")) {
        rows = await tx.$queryRaw<[{ id: number }]>`
          INSERT INTO orders (customer_name, phone_number, email, delivery_method, city, post_office, comment, payment_type, invoice_id, payment_status)
          VALUES (${order.customer_name}, ${order.phone_number}, ${order.email ?? null}, ${order.delivery_method}, ${order.city}, ${order.post_office}, ${order.comment ?? null}, ${order.payment_type}, ${order.invoice_id}, ${order.payment_status})
          RETURNING id
        `;
      } else {
        throw err;
      }
    }
    const createdId = rows[0].id;

    for (const item of order.items) {
      await tx.orderItem.create({
        data: {
          orderId: createdId,
          productId: item.product_id,
          productName: item.product_name ?? null,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          color: item.color ?? null,
        },
      });
    }

    const bonusSpent = order.bonus_points_spent ?? 0;
    if (bonusSpent > 0) {
      try {
        await tx.$executeRaw`UPDATE orders SET bonus_points_spent = ${bonusSpent} WHERE id = ${createdId}`;
      } catch {
        // Колонка bonus_points_spent може відсутня
      }
    }

    const loyaltyDiscount = order.loyalty_discount_amount ?? 0;
    if (loyaltyDiscount > 0) {
      try {
        await tx.$executeRaw`UPDATE orders SET loyalty_discount_amount = ${loyaltyDiscount} WHERE id = ${createdId}`;
      } catch {
        // Колонка loyalty_discount_amount може відсутня
      }
    }

    if (order.promo_code_id != null && order.promo_discount_amount != null) {
      try {
        await tx.$executeRaw`UPDATE orders SET promo_code_id = ${order.promo_code_id}, promo_discount_amount = ${order.promo_discount_amount} WHERE id = ${createdId}`;
        await tx.$executeRaw`UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ${order.promo_code_id}`;
      } catch {
        // Колонки promo можуть відсутня
      }
    }

    if (order.decrement_stock) {
      for (const item of order.items) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
          select: { stock: true },
        });
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Недостатньо товару на складі для товару #${item.product_id} (потрібно ${item.quantity}, доступно ${product?.stock ?? 0})`
          );
        }
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return { orderId: createdId };
  });
}

// Update an order (e.g., status change)
export async function sqlPutOrder(id: number, update: { status: string }) {
  await prisma.order.update({
    where: { id },
    data: { status: update.status },
  });
  return { updated: true };
}

// Delete an order (auto-deletes items via ON DELETE CASCADE)
export async function sqlDeleteOrder(id: number) {
  await prisma.order.delete({
    where: { id },
  });
  return { deleted: true };
}

// Get all order items for a specific order
export async function sqlGetOrderItems(orderId: number) {
  const items = await prisma.orderItem.findMany({
    where: { orderId },
    include: {
      product: {
        select: { name: true },
      },
    },
    orderBy: { id: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    order_id: item.orderId,
    product_id: item.productId,
    product_name: item.productName ?? item.product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
    size: item.size,
    quantity: item.quantity,
    price: Number(item.price),
    color: item.color,
  }));
}

// Create a single order item
export async function sqlPostOrderItem(item: {
  order_id: number;
  product_id: number;
  product_name?: string | null;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
}) {
  const created = await prisma.orderItem.create({
    data: {
      orderId: item.order_id,
      productId: item.product_id,
      productName: item.product_name ?? null,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color ?? null,
    },
    include: {
      product: { select: { name: true } },
    },
  });

  return {
    id: created.id,
    order_id: created.orderId,
    product_id: created.productId,
    product_name: created.productName ?? created.product?.name ?? (created.productId != null ? `Товар #${created.productId}` : "Товар"),
    size: created.size,
    quantity: created.quantity,
    price: Number(created.price),
    color: created.color,
  };
}

// Update (edit) an order item
export async function sqlPutOrderItem(
  id: number,
  update: {
    product_id?: number;
    product_name?: string | null;
    size?: string;
    quantity?: number;
    price?: number;
  }
) {
  const updated = await prisma.orderItem.update({
    where: { id },
    data: {
      ...(update.product_id !== undefined && { productId: update.product_id }),
      ...(update.product_name !== undefined && { productName: update.product_name }),
      ...(update.size !== undefined && { size: update.size }),
      ...(update.quantity !== undefined && { quantity: update.quantity }),
      ...(update.price !== undefined && { price: update.price }),
    },
    include: {
      product: { select: { name: true } },
    },
  });

  return {
    id: updated.id,
    order_id: updated.orderId,
    product_id: updated.productId,
    product_name: updated.productName ?? updated.product?.name ?? (updated.productId != null ? `Товар #${updated.productId}` : "Товар"),
    size: updated.size,
    quantity: updated.quantity,
    price: Number(updated.price),
    color: updated.color,
  };
}

// Delete order item
export async function sqlDeleteOrderItem(id: number) {
  await prisma.orderItem.delete({
    where: { id },
  });
  return { deleted: true };
}

export async function sqlUpdatePaymentStatus(
  invoiceId: string,
  status: string
) {
  await prisma.order.update({
    where: { invoiceId },
    data: { paymentStatus: status },
  });
}

// Get order by invoice ID for webhook processing (same imageUrl shape as basket/FinalCard)
export async function sqlGetOrderByInvoiceId(invoiceId: string) {
  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
              subcategory: { select: { name: true } },
              media: {
                orderBy: { id: "asc" },
                take: 5,
                select: { url: true, type: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    invoice_id: order.invoiceId,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    email: order.email,
    delivery_method: order.deliveryMethod,
    city: order.city,
    post_office: order.postOffice,
    comment: order.comment,
    payment_type: order.paymentType,
    payment_status: order.paymentStatus,
    created_at: order.createdAt,
    items: order.items.map((item) => {
      const product = item.product as
        | {
            id: number;
            name: string;
            category?: { name: string } | null;
            subcategory?: { name: string } | null;
            media?: { url: string; type: string }[];
          }
        | null;
      const firstPhoto = product?.media?.find((m) => m.type === "photo");
      const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
      return {
        product_name: item.productName ?? product?.name ?? (item.productId != null ? `Товар #${item.productId}` : "Товар"),
        product_id: item.productId ?? product?.id ?? null,
        category_name:
          product?.subcategory?.name ?? product?.category?.name ?? null,
        size: item.size,
        quantity: item.quantity,
        price: Number(item.price),
        color: item.color,
        imageUrl,
      };
    }),
  };
}

// =====================
// 📦 CATEGORIES
// =====================

// Get all categories
async function _sqlGetAllCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { priority: "desc" },
  });

  const result: {
    id: number;
    name: string;
    slug: string | null;
    priority: number;
    mediaType: string | null;
    mediaUrl: string | null;
    description: string | null;
    name_ru: string | null;
    description_ru: string | null;
  }[] = [];
  for (const c of categories) {
    let slug = c.slug;
    if (!slug) {
      const baseSlug = textToSlug(c.name);
      slug = await ensureUniqueSlug(baseSlug, (s) =>
        prisma.category.findFirst({ where: { slug: s, id: { not: c.id } } }).then(Boolean)
      );
      await prisma.category.update({
        where: { id: c.id },
        data: { slug },
      });
    }
    result.push({
      id: c.id,
      name: c.name,
      slug,
      priority: c.priority,
      mediaType: c.mediaType || null,
      mediaUrl: c.mediaUrl || null,
      description: (c as any).description ?? null,
      name_ru: (c as any).nameRu ?? null,
      description_ru: (c as any).descriptionRu ?? null,
    });
  }
  return result;
}

// Cached version with 20 minute revalidation
export const sqlGetAllCategories = unstable_cache(
  _sqlGetAllCategories,
  ['all-categories'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['categories'],
  }
);

// Get a single category by ID
export async function sqlGetCategory(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug ?? null,
    priority: category.priority,
    mediaType: category.mediaType || null,
    mediaUrl: category.mediaUrl || null,
    description: (category as any).description ?? null,
    name_ru: (category as any).nameRu ?? null,
    description_ru: (category as any).descriptionRu ?? null,
  };
}

// Get a single category by slug (ЧПУ)
export async function sqlGetCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: slug || undefined },
  });
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug ?? null,
    priority: category.priority,
    mediaType: category.mediaType || null,
    mediaUrl: category.mediaUrl || null,
    description: (category as any).description ?? null,
    name_ru: (category as any).nameRu ?? null,
    description_ru: (category as any).descriptionRu ?? null,
  };
}

// Get products by category slug
export async function sqlGetProductsByCategorySlug(categorySlug: string) {
  const cat = await prisma.category.findUnique({
    where: { slug: categorySlug || undefined },
    select: { id: true, name: true },
  });
  if (!cat) return [];
  return sqlGetProductsByCategory(cat.name);
}

// Create a new category
export async function sqlPostCategory(
  name: string, 
  priority: number = 0,
  mediaType?: string | null,
  mediaUrl?: string | null,
  description?: string | null
) {
  const baseSlug = textToSlug(name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.category.findFirst({ where: { slug: s } }).then(Boolean)
  );

  const createData: {
    name: string;
    slug: string;
    priority: number;
    mediaType?: string | null;
    mediaUrl?: string | null;
    description?: string | null;
  } = { 
    name, 
    slug,
    priority,
  };

  if (mediaType !== undefined) {
    createData.mediaType = mediaType;
  }
  if (mediaUrl !== undefined) {
    createData.mediaUrl = mediaUrl;
  }
  if (description !== undefined) {
    createData.description = description;
  }

  const created = await prisma.category.create({
    data: createData,
  });

  scheduleCategoryRuSync(created.id, true);

  return {
    id: created.id,
    name: created.name,
    slug: created.slug,
    priority: created.priority,
    mediaType: created.mediaType,
    mediaUrl: created.mediaUrl,
    description: (created as any).description ?? null,
    name_ru: (created as any).nameRu ?? null,
    description_ru: (created as any).descriptionRu ?? null,
  };
}

// Update a category by ID
export async function sqlPutCategory(
  id: number,
  name: string,
  priority: number = 0,
  mediaType?: string | null,
  mediaUrl?: string | null,
  description?: string | null
) {
  const updateData: {
    name: string;
    priority: number;
    slug?: string;
    mediaType?: string | null;
    mediaUrl?: string | null;
    description?: string | null;
  } = { name, priority };

  const current = await prisma.category.findUnique({ where: { id }, select: { name: true, slug: true } });
  if (current && (!current.slug || current.name !== name)) {
    const baseSlug = textToSlug(name);
    updateData.slug = await ensureUniqueSlug(baseSlug, (s) =>
      prisma.category.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
    );
  }
  
  if (mediaType !== undefined) {
    updateData.mediaType = mediaType;
  }
  if (mediaUrl !== undefined) {
    updateData.mediaUrl = mediaUrl;
  }
  if (description !== undefined) {
    updateData.description = description;
  }

  const updated = await prisma.category.update({
    where: { id },
    data: updateData,
  });

  scheduleCategoryRuSync(updated.id, true);

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug ?? null,
    priority: updated.priority,
    mediaType: updated.mediaType ?? null,
    mediaUrl: updated.mediaUrl ?? null,
    description: (updated as any).description ?? null,
    name_ru: (updated as any).nameRu ?? null,
    description_ru: (updated as any).descriptionRu ?? null,
  };
}

// Delete a category by ID
export async function sqlDeleteCategory(id: number) {
  await prisma.category.delete({
    where: { id },
  });
  return { deleted: true };
}

// =====================
// 📦 SUBCATEGORIES
// =====================

// Get all subcategories
export async function sqlGetAllSubcategories() {
  const subcategories = await prisma.subcategory.findMany({
    orderBy: { id: "asc" },
  });

  return subcategories.map((sc) => ({
    id: sc.id,
    name: sc.name,
    slug: sc.slug ?? null,
    category_id: sc.categoryId,
    name_ru: (sc as any).nameRu ?? null,
  }));
}

// Get all subcategories for a specific category (backfills slug if missing)
export async function sqlGetSubcategoriesByCategory(categoryId: number) {
  const subcategories = await prisma.subcategory.findMany({
    where: { categoryId },
    orderBy: { id: "asc" },
  });

  const result: { id: number; name: string; slug: string | null; category_id: number; name_ru: string | null }[] = [];
  for (const sc of subcategories) {
    let slug = sc.slug;
    if (!slug) {
      const baseSlug = textToSlug(sc.name);
      slug = await ensureUniqueSlug(baseSlug, (s) =>
        prisma.subcategory.findFirst({ where: { slug: s, id: { not: sc.id } } }).then(Boolean)
      );
      await prisma.subcategory.update({
        where: { id: sc.id },
        data: { slug },
      });
    }
    result.push({
      id: sc.id,
      name: sc.name,
      slug,
      category_id: sc.categoryId,
      name_ru: (sc as any).nameRu ?? null,
    });
  }
  return result;
}

// Get a single subcategory by ID
export async function sqlGetSubcategory(id: number) {
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
  });

  if (!subcategory) return null;

  return {
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug ?? null,
    category_id: subcategory.categoryId,
  };
}

// Get a single subcategory by slug
export async function sqlGetSubcategoryBySlug(slug: string) {
  const subcategory = await prisma.subcategory.findFirst({
    where: { slug },
  });

  if (!subcategory) return null;

  return {
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug ?? null,
    category_id: subcategory.categoryId,
  };
}

// Create a new subcategory (generates slug from name)
export async function sqlPostSubcategory(name: string, categoryId: number) {
  const baseSlug = textToSlug(name);
  const slug = await ensureUniqueSlug(baseSlug, (s) =>
    prisma.subcategory.findFirst({ where: { slug: s } }).then(Boolean)
  );
  const created = await prisma.subcategory.create({
    data: { name, slug, categoryId },
  });

  scheduleSubcategoryRuSync(created.id, true);

  return {
    id: created.id,
    name: created.name,
    slug: created.slug,
    category_id: created.categoryId,
    name_ru: (created as any).nameRu ?? null,
  };
}

// Update a subcategory by ID (updates slug if name changed)
export async function sqlPutSubcategory(
  id: number,
  name: string,
  categoryId: number
) {
  const current = await prisma.subcategory.findUnique({
    where: { id },
    select: { name: true, slug: true },
  });
  type UpdateData = { name: string; categoryId: number; slug?: string };
  const updateData: UpdateData = { name, categoryId };
  if (current && (!current.slug || current.name !== name)) {
    const baseSlug = textToSlug(name);
    updateData.slug = await ensureUniqueSlug(baseSlug, (s) =>
      prisma.subcategory.findFirst({ where: { slug: s, id: { not: id } } }).then(Boolean)
    );
  }
  const updated = await prisma.subcategory.update({
    where: { id },
    data: updateData,
  });

  scheduleSubcategoryRuSync(updated.id, true);

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug ?? null,
    category_id: updated.categoryId,
    name_ru: (updated as any).nameRu ?? null,
  };
}

// Delete a subcategory by ID
export async function sqlDeleteSubcategory(id: number) {
  await prisma.subcategory.delete({
    where: { id },
  });
  return { deleted: true };
}
