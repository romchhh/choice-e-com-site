import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clampRating, mapPrismaReview } from "@/lib/reviews";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/reviews/[id]
 * body: { action: "approve" | "reject" | "delete" | "update", ... }
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Некоректний id" }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Не знайдено" }, { status: 404 });
    }

    const body = await req.json();
    const action = typeof body.action === "string" ? body.action : "update";

    if (action === "delete") {
      await prisma.review.delete({ where: { id } });
      return NextResponse.json({ ok: true, deleted: true });
    }

    if (action === "approve") {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          status: "approved",
          moderatedAt: new Date(),
          showOnHome:
            typeof body.show_on_home === "boolean"
              ? body.show_on_home
              : existing.showOnHome,
        },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      });
      return NextResponse.json(mapPrismaReview(updated));
    }

    if (action === "reject") {
      const updated = await prisma.review.update({
        where: { id },
        data: {
          status: "rejected",
          moderatedAt: new Date(),
          showOnHome: false,
        },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      });
      return NextResponse.json(mapPrismaReview(updated));
    }

    // update fields
    const data: {
      authorName?: string;
      text?: string;
      rating?: number;
      photoUrl?: string | null;
      productId?: number | null;
      showOnHome?: boolean;
      status?: string;
      moderatedAt?: Date | null;
    } = {};

    if (typeof body.author_name === "string" && body.author_name.trim()) {
      data.authorName = body.author_name.trim();
    }
    if (typeof body.text === "string" && body.text.trim()) {
      data.text = body.text.trim();
    }
    if (body.rating != null) data.rating = clampRating(body.rating);
    if (body.photo_url !== undefined) {
      data.photoUrl =
        typeof body.photo_url === "string" && body.photo_url.trim()
          ? body.photo_url.trim()
          : null;
    }
    if (body.product_id !== undefined) {
      data.productId =
        body.product_id == null || body.product_id === ""
          ? null
          : Number(body.product_id);
    }
    if (typeof body.show_on_home === "boolean") {
      data.showOnHome = body.show_on_home;
    }
    if (
      body.status === "pending" ||
      body.status === "approved" ||
      body.status === "rejected"
    ) {
      data.status = body.status;
      data.moderatedAt =
        body.status === "pending" ? null : new Date();
    }

    const updated = await prisma.review.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json(mapPrismaReview(updated));
  } catch (e) {
    console.error("[admin/reviews PUT]", e);
    return NextResponse.json({ error: "Не вдалося оновити" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Некоректний id" }, { status: 400 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/reviews DELETE]", e);
    return NextResponse.json({ error: "Не вдалося видалити" }, { status: 500 });
  }
}
