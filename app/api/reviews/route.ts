import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clampRating, mapPrismaReview } from "@/lib/reviews";
import {
  getApprovedHomeReviews,
  getApprovedProductReviews,
  getProductRatingSummary,
} from "@/lib/reviews.server";
import { sendReviewNotification } from "@/lib/telegram";

/**
 * GET /api/reviews?productId=1 | ?home=1
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const home = searchParams.get("home") === "1";
    const productIdRaw = searchParams.get("productId");

    if (home) {
      const list = await getApprovedHomeReviews(24);
      return NextResponse.json(list);
    }

    if (productIdRaw) {
      const productId = Number(productIdRaw);
      if (!Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
      }
      const [reviews, summary] = await Promise.all([
        getApprovedProductReviews(productId),
        getProductRatingSummary(productId),
      ]);
      return NextResponse.json({ reviews, summary });
    }

    return NextResponse.json(
      { error: "Specify productId or home=1" },
      { status: 400 }
    );
  } catch (e) {
    console.error("[GET /api/reviews]", e);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

/**
 * POST /api/reviews — public customer submit (pending moderation)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authorName =
      typeof body.author_name === "string" ? body.author_name.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const rating = clampRating(body.rating);
    const authorEmail =
      typeof body.author_email === "string" ? body.author_email.trim() : null;
    const photoUrl =
      typeof body.photo_url === "string" && body.photo_url.trim()
        ? body.photo_url.trim()
        : null;
    const productId = Number(body.product_id);
    const token =
      typeof body.token === "string" && body.token.trim()
        ? body.token.trim()
        : null;

    if (!authorName || authorName.length < 2) {
      return NextResponse.json(
        { error: "Вкажіть ім'я (мін. 2 символи)" },
        { status: 400 }
      );
    }
    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: "Текст відгуку занадто короткий" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Оберіть товар" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
    }

    let orderId: number | null = null;
    let emailFromToken: string | null = null;
    if (token) {
      const request = await prisma.reviewRequest.findUnique({
        where: { token },
        include: {
          order: {
            include: { items: { select: { productId: true } } },
          },
        },
      });
      if (!request) {
        return NextResponse.json(
          { error: "Недійсне посилання для відгуку" },
          { status: 400 }
        );
      }
      const allowed = request.order.items.some(
        (i) => i.productId === productId
      );
      if (!allowed) {
        return NextResponse.json(
          { error: "Цей товар не входить до замовлення" },
          { status: 400 }
        );
      }
      orderId = request.orderId;
      emailFromToken = request.email;
    }

    const created = await prisma.review.create({
      data: {
        authorName,
        authorEmail: authorEmail || emailFromToken,
        text,
        rating,
        photoUrl,
        productId,
        orderId,
        status: "pending",
        source: "customer",
        showOnHome: false,
      },
      include: { product: { select: { id: true, name: true, slug: true } } },
    });

    void sendReviewNotification({
      id: created.id,
      authorName: created.authorName,
      rating: created.rating,
      text: created.text,
      productName: product.name,
      source: "customer",
      hasPhoto: Boolean(created.photoUrl),
    });

    return NextResponse.json(mapPrismaReview(created), { status: 201 });
  } catch (e) {
    console.error("[POST /api/reviews]", e);
    return NextResponse.json(
      { error: "Не вдалося надіслати відгук" },
      { status: 500 }
    );
  }
}
