import { revalidateTag } from "next/cache";

/** Invalidate product list/detail caches (safe to call from server code). */
export function invalidateProductsCache() {
  try {
    revalidateTag("products", "max");
  } catch (e) {
    console.error("[invalidateProductsCache]", e);
  }
}

export function invalidateCategoriesCache() {
  try {
    revalidateTag("categories", "max");
  } catch (e) {
    console.error("[invalidateCategoriesCache]", e);
  }
}

/**
 * Server action to revalidate product cache
 * Call this after creating/updating/deleting products
 */
export async function revalidateProducts() {
  "use server";
  invalidateProductsCache();
}

/**
 * Server action to revalidate category cache
 * Call this after creating/updating/deleting categories
 */
export async function revalidateCategories() {
  "use server";
  invalidateCategoriesCache();
}

/**
 * Server action to revalidate all caches
 */
export async function revalidateAll() {
  "use server";
  invalidateProductsCache();
  invalidateCategoriesCache();
}
