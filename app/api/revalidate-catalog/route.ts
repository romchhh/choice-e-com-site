import { NextResponse } from "next/server";
import { invalidateCategoriesCache, invalidateProductsCache } from "@/lib/revalidate";

/**
 * POST /api/revalidate-catalog
 * Clears product/category caches after translate:ru or manual RU updates.
 * Optional: REVALIDATE_SECRET in env; if set, require ?secret= or header x-revalidate-secret.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (secret) {
    const url = new URL(req.url);
    const fromQuery = url.searchParams.get("secret");
    const fromHeader = req.headers.get("x-revalidate-secret");
    if (fromQuery !== secret && fromHeader !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  invalidateProductsCache();
  invalidateCategoriesCache();
  return NextResponse.json({ revalidated: true, tags: ["products", "categories"] });
}
