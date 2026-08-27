#!/usr/bin/env ts-node

/**
 * Тестові hero-банери для головної сторінки.
 *
 * Запуск: npm run seed-hero-banners
 */

import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvUrl(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        let value = trimmed.slice(13).trim();
        if (value.startsWith('"') || value.startsWith("'")) {
          const quote = value[0];
          const end = value.indexOf(quote, 1);
          value = end > 0 ? value.slice(1, end) : value.slice(1);
        }
        value = value.split(/\s+#\s+/)[0].trim();
        if (value) process.env.DATABASE_URL = value;
        break;
      }
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL не задано. Перевірте .env");
    process.exit(1);
  }
}

const TEST_BANNERS = [
  {
    title: "Програма місяця",
    titleRu: "Программа месяца",
    subtitle:
      "Рослинні комплекси Choice для енергії, імунітету та гармонії щодня.",
    subtitleRu:
      "Растительные комплексы Choice для энергии, иммунитета и гармонии каждый день.",
    priceLabel: "від 1 890 ₴",
    priceLabelRu: "от 1 890 ₴",
    ctaLabel: "До каталогу",
    ctaLabelRu: "В каталог",
    href: "/catalog",
    imageUrl: "/images/hero-banners/wellness-salad.jpg",
    imageUrlMobile: "/images/hero-banners/wellness-salad.jpg",
    sortOrder: 0,
  },
  {
    title: "Безкоштовна доставка",
    titleRu: "Бесплатная доставка",
    subtitle: "Замовлення від 2 000 ₴ — доставимо безкоштовно по Україні.",
    subtitleRu: "Заказы от 2 000 ₴ — доставим бесплатно по Украине.",
    priceLabel: "від 2 000 ₴",
    priceLabelRu: "от 2 000 ₴",
    ctaLabel: "Обрати товари",
    ctaLabelRu: "Выбрать товары",
    href: "/catalog",
    imageUrl: "/images/hero-banners/herbs-green.jpg",
    imageUrlMobile: "/images/hero-banners/herbs-green.jpg",
    sortOrder: 1,
  },
  {
    title: "Акції та новинки",
    titleRu: "Акции и новинки",
    subtitle: "Знижки на курси та подарунки до обраних позицій.",
    subtitleRu: "Скидки на курсы и подарки к выбранным позициям.",
    priceLabel: "до −15%",
    priceLabelRu: "до −15%",
    ctaLabel: "Дивитись акції",
    ctaLabelRu: "Смотреть акции",
    href: "/catalog?promo=1",
    imageUrl: "/images/hero-banners/natural-supplements.jpg",
    imageUrlMobile: "/images/hero-banners/natural-supplements.jpg",
    sortOrder: 2,
  },
] as const;

function formatPriceUa(amount: number): string {
  return `${Math.round(amount).toLocaleString("uk-UA")} ₴`;
}

/** Promo slide for a real catalog product (prefers bestseller with photo). */
async function seedProductHeroBanner(prisma: PrismaClient): Promise<void> {
  const preferredSlugs = [
    "kompleks-imunitet",
    "kompleks-balans-zhinky",
    "fitokompleks-detoks",
    "prohrama-enerhiya-dnya",
  ];

  let product: Awaited<ReturnType<typeof prisma.product.findFirst>> & {
    media?: { url: string }[];
  } | null = null;

  for (const slug of preferredSlugs) {
    const row = await prisma.product.findFirst({
      where: { slug, inStock: true },
      include: { media: { take: 1, orderBy: { id: "asc" } } },
    });
    if (row) {
      product = row;
      break;
    }
  }

  if (!product) {
    product = await prisma.product.findFirst({
      where: {
        slug: { not: null },
        inStock: true,
        NOT: { name: { in: ["назва", "test"] } },
      },
      orderBy: [{ topSale: "desc" }, { isHit: "desc" }, { id: "asc" }],
      include: { media: { take: 1, orderBy: { id: "asc" } } },
    });
  }

  if (!product?.slug) {
    console.log("⚠️  Немає товару зі slug — банер товару пропущено.");
    return;
  }

  const price = Number(product.price);
  const oldPrice = product.oldPrice != null ? Number(product.oldPrice) : null;
  const priceLabel =
    oldPrice != null && oldPrice > price
      ? `${formatPriceUa(price)} · було ${formatPriceUa(oldPrice)}`
      : formatPriceUa(price);

  const imageFromMedia = product.media?.[0]?.url ?? null;

  const data = {
    title: product.name,
    titleRu: product.nameRu ?? product.name,
    subtitle:
      product.shortDescription?.trim() ||
      "Офіційний дистриб’ютор Choice — оригінальна продукція з доставкою по Україні.",
    subtitleRu:
      product.shortDescriptionRu?.trim() ||
      "Официальный дистрибьютор Choice — оригинальная продукция с доставкой по Украине.",
    priceLabel,
    priceLabelRu: priceLabel,
    ctaLabel: "До товару",
    ctaLabelRu: "К товару",
    href: `/product/${product.slug}`,
    imageUrl: imageFromMedia ?? "/images/hero-banners/natural-supplements.jpg",
    imageUrlMobile:
      imageFromMedia ?? "/images/hero-banners/natural-supplements.jpg",
    sortOrder: 0,
  };

  const existing = await prisma.heroBanner.findFirst({
    where: { href: data.href },
  });

  if (existing) {
    await prisma.heroBanner.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        titleRu: data.titleRu,
        subtitle: data.subtitle,
        subtitleRu: data.subtitleRu,
        priceLabel: data.priceLabel,
        priceLabelRu: data.priceLabelRu,
        ctaLabel: data.ctaLabel,
        ctaLabelRu: data.ctaLabelRu,
        imageUrl: data.imageUrl,
        imageUrlMobile: data.imageUrlMobile,
        sortOrder: data.sortOrder,
        isActive: true,
      },
    });
    console.log(`🛍  Оновлено банер товару: «${product.name}» → ${data.href}`);
    return;
  }

  await prisma.heroBanner.create({
    data: { ...data, isActive: true },
  });
  console.log(`🛍  Створено банер товару: «${product.name}» → ${data.href}`);
}

async function main() {
  loadEnvUrl();
  const prisma = new PrismaClient();

  try {
    const existing = await prisma.heroBanner.count();
    if (existing > 0) {
      console.log(
        `ℹ️  У базі вже є ${existing} hero-банер(ів). Додаємо тестові, якщо їх ще немає…`
      );
    }

    let created = 0;
    let updated = 0;
    for (const banner of TEST_BANNERS) {
      const duplicate = await prisma.heroBanner.findFirst({
        where: { title: banner.title, href: banner.href },
      });
      if (duplicate) {
        const needsImageUpdate =
          duplicate.imageUrl !== banner.imageUrl ||
          duplicate.imageUrlMobile !== (banner.imageUrlMobile ?? null);
        if (needsImageUpdate) {
          await prisma.heroBanner.update({
            where: { id: duplicate.id },
            data: {
              imageUrl: banner.imageUrl,
              imageUrlMobile: banner.imageUrlMobile ?? null,
            },
          });
          updated += 1;
          console.log(`🖼  Оновлено зображення: «${banner.title}»`);
        } else {
          console.log(`⏭  Пропущено (вже є): «${banner.title}»`);
        }
        continue;
      }

      await prisma.heroBanner.create({
        data: {
          title: banner.title,
          titleRu: banner.titleRu,
          subtitle: banner.subtitle,
          subtitleRu: banner.subtitleRu,
          priceLabel: banner.priceLabel,
          priceLabelRu: banner.priceLabelRu,
          ctaLabel: banner.ctaLabel,
          ctaLabelRu: banner.ctaLabelRu,
          href: banner.href,
          imageUrl: banner.imageUrl,
          imageUrlMobile: banner.imageUrlMobile ?? null,
          sortOrder: banner.sortOrder,
          isActive: true,
        },
      });
      created += 1;
      console.log(`✅ Створено: «${banner.title}»`);
    }

    await seedProductHeroBanner(prisma);

    const total = await prisma.heroBanner.count();
    console.log(
      `\nГотово. Додано ${created}, оновлено зображень ${updated}, усього банерів: ${total}.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
