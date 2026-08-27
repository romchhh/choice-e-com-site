#!/usr/bin/env ts-node

/**
 * Демо-каталог Choice для ForBody: категорії + тестові товари
 * (бестселери, новинки, акції, подарунок).
 *
 * Запуск: npm run seed-demo-catalog
 */

import fs from "node:fs";
import path from "node:path";

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

const CATEGORIES = [
  {
    name: "Фітокомплекси",
    nameRu: "Фитокомплексы",
    priority: 10,
    description: "Рослинні комплекси для підтримки організму.",
  },
  {
    name: "Імунітет і енергія",
    nameRu: "Иммунитет и энергия",
    priority: 9,
    description: "Програми для тонусу, захисту та відновлення.",
  },
  {
    name: "Догляд за тілом",
    nameRu: "Уход за телом",
    priority: 8,
    description: "Натуральний догляд Choice.",
  },
  {
    name: "Eco для дому",
    nameRu: "Eco для дома",
    priority: 7,
    description: "Еко-засоби для чистого простору.",
  },
] as const;

type DemoProduct = {
  name: string;
  name_ru: string;
  categoryName: string;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  top_sale?: boolean;
  limited_edition?: boolean;
  is_promo?: boolean;
  is_hit?: boolean;
  free_delivery_badge?: boolean;
  course?: string;
  package_weight?: string;
  short_description?: string;
  giftForName?: string; // gift for another product by name (set after create)
};

const PRODUCTS: DemoProduct[] = [
  {
    name: "Комплекс «Імунітет+»",
    name_ru: "Комплекс «Иммунитет+»",
    categoryName: "Імунітет і енергія",
    price: 1890,
    old_price: 2200,
    discount_percentage: 14,
    top_sale: true,
    is_promo: true,
    is_hit: true,
    free_delivery_badge: true,
    course: "30 днів",
    package_weight: "60 капсул",
    short_description: "Підтримка імунітету на курс 1 місяць.",
  },
  {
    name: "Фітокомплекс «Детокс»",
    name_ru: "Фитокомплекс «Детокс»",
    categoryName: "Фітокомплекси",
    price: 1650,
    top_sale: true,
    course: "21 день",
    package_weight: "90 таблеток",
    short_description: "М’яке очищення та підтримка печінки.",
  },
  {
    name: "Програма «Енергія дня»",
    name_ru: "Программа «Энергия дня»",
    categoryName: "Імунітет і енергія",
    price: 2100,
    limited_edition: true,
    top_sale: true,
    course: "30 днів",
    package_weight: "набір",
    short_description: "Новинка Choice для тонусу без кавового «відкату».",
  },
  {
    name: "Олія для тіла «Ніжний догляд»",
    name_ru: "Масло для тела «Нежный уход»",
    categoryName: "Догляд за тілом",
    price: 890,
    limited_edition: true,
    is_promo: true,
    package_weight: "100 мл",
    short_description: "Натуральний догляд зі знижкою місяця.",
  },
  {
    name: "Eco-гель для прибирання",
    name_ru: "Eco-гель для уборки",
    categoryName: "Eco для дому",
    price: 420,
    package_weight: "500 мл",
    short_description: "Без різкої хімії — для щоденного прибирання.",
  },
  {
    name: "Міні-набір «Старт курсу»",
    name_ru: "Мини-набор «Старт курса»",
    categoryName: "Фітокомплекси",
    price: 590,
    package_weight: "пробний",
    short_description: "Тестовий набір — ідеальний подарунок до програми.",
  },
  {
    name: "Комплекс «Баланс жінки»",
    name_ru: "Комплекс «Баланс женщины»",
    categoryName: "Фітокомплекси",
    price: 2450,
    old_price: 2790,
    discount_percentage: 12,
    is_promo: true,
    top_sale: true,
    free_delivery_badge: true,
    course: "60 днів",
    package_weight: "120 капсул",
    short_description: "Акційна програма з подарунком у комплекті.",
    giftForName: "Міні-набір «Старт курсу»",
  },
  {
    name: "Спрей для дому «Свіжість»",
    name_ru: "Спрей для дома «Свежесть»",
    categoryName: "Eco для дому",
    price: 510,
    limited_edition: true,
    package_weight: "250 мл",
    short_description: "Новинка для свіжого повітря вдома.",
  },
];

async function main() {
  loadEnvUrl();
  const { prisma } = await import("../lib/prisma");
  const { sqlPostCategory, sqlPostProduct } = await import("../lib/sql");

  console.log("🚀 Seed демо-каталогу Choice...\n");

  const categoryIdByName = new Map<string, number>();

  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (existing) {
      categoryIdByName.set(cat.name, existing.id);
      console.log(`⏭️  Категорія вже є: ${cat.name}`);
      continue;
    }
    const created = await sqlPostCategory(cat.name, cat.priority);
    // RU + description if columns exist
    try {
      await prisma.category.update({
        where: { id: created.id },
        data: {
          nameRu: cat.nameRu,
          description: cat.description,
        },
      });
    } catch {
      /* optional fields */
    }
    categoryIdByName.set(cat.name, created.id);
    console.log(`✅ Категорія: ${cat.name}`);
  }

  const productIdByName = new Map<string, number>();

  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({
      where: { name: p.name },
    });
    if (existing) {
      productIdByName.set(p.name, existing.id);
      console.log(`⏭️  Товар вже є: ${p.name}`);
      continue;
    }

    const categoryId = categoryIdByName.get(p.categoryName);
    if (!categoryId) {
      console.warn(`⚠️  Немає категорії для «${p.name}», пропуск`);
      continue;
    }

    const created = await sqlPostProduct({
      name: p.name,
      short_description: p.short_description ?? null,
      description: p.short_description ?? null,
      price: p.price,
      old_price: p.old_price ?? null,
      discount_percentage: p.discount_percentage ?? null,
      top_sale: p.top_sale ?? false,
      limited_edition: p.limited_edition ?? false,
      is_promo: p.is_promo ?? false,
      is_hit: p.is_hit ?? false,
      free_delivery_badge: p.free_delivery_badge ?? false,
      in_stock: true,
      stock: 50,
      priority: p.top_sale ? 10 : 5,
      course: p.course ?? null,
      package_weight: p.package_weight ?? null,
      category_id: categoryId,
      category_ids: [categoryId],
      media: [],
    });

    try {
      await prisma.product.update({
        where: { id: created.id },
        data: { nameRu: p.name_ru },
      });
    } catch {
      /* optional */
    }

    productIdByName.set(p.name, created.id);
    console.log(`✅ Товар: ${p.name} (#${created.id})`);
  }

  // Link gifts
  for (const p of PRODUCTS) {
    if (!p.giftForName) continue;
    const productId = productIdByName.get(p.name);
    const giftId = productIdByName.get(p.giftForName);
    if (!productId || !giftId) continue;
    await prisma.product.update({
      where: { id: productId },
      data: { giftProductId: giftId },
    });
    console.log(`🎁 Подарунок: «${p.name}» → «${p.giftForName}»`);
  }

  console.log("\n🎉 Демо-каталог готовий.");
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
