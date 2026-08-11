/**
 * Backfill RU translations for categories, subcategories and products.
 * Providers: Google Translate (primary) → MyMemory (fallback).
 *
 * Usage:
 *   npm run translate:ru
 *   npm run translate:ru -- --force
 *
 * Env: DATABASE_URL, optional MYMEMORY_EMAIL
 */
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2].replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

async function main() {
  const { prisma } = await import("../lib/prisma");
  const {
    syncCategoryRuTranslation,
    syncProductRuTranslation,
    syncSubcategoryRuTranslation,
  } = await import("../lib/translate/catalogRu");

  const force = process.argv.includes("--force");
  console.log(`translate-catalog-to-ru (force=${force})`);
  console.log("Providers: Google Translate → MyMemory fallback");

  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  console.log(`Categories: ${categories.length}`);
  for (const c of categories) {
    try {
      await syncCategoryRuTranslation(c.id, { force });
      console.log(`  ✓ category #${c.id} ${c.name}`);
    } catch (e) {
      console.error(`  ✗ category #${c.id}`, e instanceof Error ? e.message : e);
    }
  }

  const subs = await prisma.subcategory.findMany({ select: { id: true, name: true } });
  console.log(`Subcategories: ${subs.length}`);
  for (const s of subs) {
    try {
      await syncSubcategoryRuTranslation(s.id, { force });
      console.log(`  ✓ subcategory #${s.id} ${s.name}`);
    } catch (e) {
      console.error(`  ✗ subcategory #${s.id}`, e instanceof Error ? e.message : e);
    }
  }

  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  console.log(`Products: ${products.length}`);
  for (const p of products) {
    try {
      await syncProductRuTranslation(p.id, { force });
      console.log(`  ✓ product #${p.id} ${p.name}`);
    } catch (e) {
      console.error(`  ✗ product #${p.id}`, e instanceof Error ? e.message : e);
    }
  }

  console.log("Done.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
