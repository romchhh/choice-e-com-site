import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapPrismaReview } from "@/lib/reviews";

/**
 * GET /api/reviews/by-token?token=...
 * Returns order products for the review form.
 */
export async function GET(req: NextRequest) {
  try {
    const token = new URL(req.url).searchParams.get("token")?.trim();
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const request = await prisma.reviewRequest.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            items: {
              select: {
                productId: true,
                productName: true,
                product: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const productsMap = new Map<
      number,
      { id: number; name: string; slug: string | null }
    >();
    for (const item of request.order.items) {
      if (item.productId && item.product) {
        productsMap.set(item.product.id, {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
        });
      } else if (item.productId) {
        productsMap.set(item.productId, {
          id: item.productId,
          name: item.productName || `Товар #${item.productId}`,
          slug: null,
        });
      }
    }

    return NextResponse.json({
      token: request.token,
      email: request.email,
      customer_name: request.order.customerName,
      order_id: request.orderId,
      products: Array.from(productsMap.values()),
    });
  } catch (e) {
    console.error("[GET /api/reviews/by-token]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
