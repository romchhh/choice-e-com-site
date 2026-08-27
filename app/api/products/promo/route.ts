import { sqlGetPromoProducts } from "@/lib/sql";
import { NextResponse } from "next/server";
import { apiLogger } from "@/lib/logger";

export const revalidate = 1200;

export async function GET() {
  try {
    const products = await sqlGetPromoProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/promo", error);
    return NextResponse.json(
      { error: "Failed to fetch promo products" },
      { status: 500 }
    );
  }
}
