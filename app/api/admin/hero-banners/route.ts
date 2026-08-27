import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mapPrismaHeroBanner, normalizeHeroCtaColor } from "@/lib/heroBanners";
import { getAllHeroBannersAdmin } from "@/lib/heroBanners.server";

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

/**
 * GET /api/admin/hero-banners — all banners for admin
 */
export async function GET() {
  try {
    const list = await getAllHeroBannersAdmin();
    return NextResponse.json(list);
  } catch (e) {
    console.error("[admin/hero-banners GET]", e);
    return NextResponse.json(
      { error: "Не вдалося завантажити hero-банери" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero-banners — create banner
 */
export async function POST(req: NextRequest) {
  try {
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

    const created = await prisma.heroBanner.create({
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
    return NextResponse.json(mapPrismaHeroBanner(created), { status: 201 });
  } catch (e) {
    console.error("[admin/hero-banners POST]", e);
    return NextResponse.json(
      { error: "Не вдалося створити банер" },
      { status: 500 }
    );
  }
}
