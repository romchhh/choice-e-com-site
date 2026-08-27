import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clampRating, mapPrismaReview } from "@/lib/reviews";
import { sendReviewNotification } from "@/lib/telegram";

/**
 * GET /api/admin/reviews?status=pending|approved|rejected|all&productId=123
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const productIdRaw = searchParams.get("productId");
    const productId = productIdRaw ? Number(productIdRaw) : null;

    const where: {
      status?: string;
      productId?: number;
    } = {};

    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      where.status = status;
    }

    if (productId != null && Number.isInteger(productId) && productId > 0) {
      where.productId = productId;
    }

    const rows = await prisma.review.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json(rows.map(mapPrismaReview));
  } catch (e) {
    console.error("[admin/reviews GET]", e);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

/**
 * POST /api/admin/reviews — create review from admin (optionally auto-approved)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authorName =
      typeof body.author_name === "string" ? body.author_name.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const rating = clampRating(body.rating);
    const photoUrl =
      typeof body.photo_url === "string" && body.photo_url.trim()
        ? body.photo_url.trim()
        : null;
    const productIdRaw = body.product_id;
    const productId =
      productIdRaw == null || productIdRaw === ""
        ? null
        : Number(productIdRaw);
    const showOnHome = body.show_on_home === true;
    const approve = body.approve !== false;

    if (!authorName) {
      return NextResponse.json({ error: "Ім'я обов'язкове" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "Текст обов'язковий" }, { status: 400 });
    }
    if (productId != null && (!Number.isInteger(productId) || productId <= 0)) {
      return NextResponse.json({ error: "Некоректний товар" }, { status: 400 });
    }

    if (productId != null) {
      const exists = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
      }
    }

    const created = await prisma.review.create({
      data: {
        authorName,
        text,
        rating,
        photoUrl,
        productId,
        status: approve ? "approved" : "pending",
        source: "admin",
        showOnHome: approve ? showOnHome : false,
        moderatedAt: approve ? new Date() : null,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!approve) {
      void sendReviewNotification({
        id: created.id,
        authorName: created.authorName,
        rating: created.rating,
        text: created.text,
        productName: created.product?.name,
        source: "admin",
      });
    }

    return NextResponse.json(mapPrismaReview(created), { status: 201 });
  } catch (e) {
    console.error("[admin/reviews POST]", e);
    return NextResponse.json({ error: "Не вдалося створити" }, { status: 500 });
  }
}
