import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mapPrismaHeroBanner, normalizeHeroCtaColor } from "@/lib/heroBanners";

function normalizeHref(raw: unknown): string {
  const href = typeof raw === "string" ? raw.trim() : "";
  if (!href) return "/catalog";
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/")) {
    return href;
  }
  return `/${href}`;
}

function optionalText(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s || null;
}

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PUT /api/admin/hero-banners/[id]
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Некоректний id" }, { status: 400 });
    }

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const imageUrl =
      typeof body.image_url === "string" ? body.image_url.trim() : "";
    const ctaLabel =
      typeof body.cta_label === "string" && body.cta_label.trim()
        ? body.cta_label.trim()
        : "Купити";

    if (!title) {
      return NextResponse.json(
        { error: "Заголовок обов'язковий" },
        { status: 400 }
      );
    }
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Зображення обов'язкове" },
        { status: 400 }
      );
    }

    const updated = await prisma.heroBanner.update({
      where: { id },
      data: {
        title,
        titleRu: optionalText(body.title_ru),
        subtitle: optionalText(body.subtitle),
        subtitleRu: optionalText(body.subtitle_ru),
        badge: optionalText(body.badge),
        badgeRu: optionalText(body.badge_ru),
        benefitText: optionalText(body.benefit_text),
        benefitTextRu: optionalText(body.benefit_text_ru),
        priceLabel: optionalText(body.price_label),
        priceLabelRu: optionalText(body.price_label_ru),
        ctaLabel,
        ctaLabelRu: optionalText(body.cta_label_ru),
        ctaColor: normalizeHeroCtaColor(body.cta_color),
        href: normalizeHref(body.href),
        imageUrl,
        imageUrlMobile: optionalText(body.image_url_mobile),
        sortOrder: Number.isFinite(Number(body.sort_order))
          ? Number(body.sort_order)
          : 0,
        isActive: body.is_active !== false,
        startsAt: body.starts_at ? new Date(body.starts_at) : null,
        endsAt: body.ends_at ? new Date(body.ends_at) : null,
      },
    });

    revalidateTag("hero-banners", "max");
    return NextResponse.json(mapPrismaHeroBanner(updated));
  } catch (e) {
    console.error("[admin/hero-banners PUT]", e);
    return NextResponse.json(
      { error: "Не вдалося оновити банер" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/hero-banners/[id]
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id: idRaw } = await context.params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Некоректний id" }, { status: 400 });
    }

    await prisma.heroBanner.delete({ where: { id } });
    revalidateTag("hero-banners", "max");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/hero-banners DELETE]", e);
    return NextResponse.json(
      { error: "Не вдалося видалити банер" },
      { status: 500 }
    );
  }
}
