import { prisma } from "../prisma";
import { translateFieldsUkToRu } from "./freeTranslate";

const PRODUCT_TEXT_KEYS = [
  "name",
  "subtitle",
  "releaseForm",
  "course",
  "packageWeight",
  "mainInfo",
  "shortDescription",
  "description",
  "mainAction",
  "indicationsForUse",
  "benefits",
  "fullComposition",
  "usageMethod",
  "contraindications",
  "storageConditions",
  "fabricComposition",
  "liningDescription",
] as const;

type ProductTextKey = (typeof PRODUCT_TEXT_KEYS)[number];

const PRODUCT_RU_MAP: Record<ProductTextKey, string> = {
  name: "nameRu",
  subtitle: "subtitleRu",
  releaseForm: "releaseFormRu",
  course: "courseRu",
  packageWeight: "packageWeightRu",
  mainInfo: "mainInfoRu",
  shortDescription: "shortDescriptionRu",
  description: "descriptionRu",
  mainAction: "mainActionRu",
  indicationsForUse: "indicationsForUseRu",
  benefits: "benefitsRu",
  fullComposition: "fullCompositionRu",
  usageMethod: "usageMethodRu",
  contraindications: "contraindicationsRu",
  storageConditions: "storageConditionsRu",
  fabricComposition: "fabricCompositionRu",
  liningDescription: "liningDescriptionRu",
};

export async function syncProductRuTranslation(
  productId: number,
  options?: { force?: boolean }
): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const toTranslate: Record<string, string | null | undefined> = {};
  for (const key of PRODUCT_TEXT_KEYS) {
    const ua = product[key] as string | null | undefined;
    const ruKey = PRODUCT_RU_MAP[key] as keyof typeof product;
    const existingRu = product[ruKey] as string | null | undefined;
    if (!options?.force && existingRu && String(existingRu).trim()) continue;
    if (ua != null && String(ua).trim()) toTranslate[key] = ua;
  }

  if (Object.keys(toTranslate).length === 0) return;

  const translated = await translateFieldsUkToRu(toTranslate);
  const data: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(translated)) {
    const ruField = PRODUCT_RU_MAP[key as ProductTextKey];
    if (ruField && value != null) data[ruField] = value;
  }

  if (Object.keys(data).length === 0) return;
  await prisma.product.update({ where: { id: productId }, data: data as any });
}

export async function syncCategoryRuTranslation(
  categoryId: number,
  options?: { force?: boolean }
): Promise<void> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return;

  const fields: Record<string, string | null | undefined> = {};
  if (options?.force || !category.nameRu) fields.name = category.name;
  if (options?.force || !category.descriptionRu) {
    fields.description = category.description;
  }

  const translated = await translateFieldsUkToRu(fields);
  const data: { nameRu?: string | null; descriptionRu?: string | null } = {};
  if (translated.name) data.nameRu = translated.name;
  if (translated.description !== undefined) data.descriptionRu = translated.description;

  if (Object.keys(data).length === 0) return;
  await prisma.category.update({ where: { id: categoryId }, data });
}

export async function syncSubcategoryRuTranslation(
  subcategoryId: number,
  options?: { force?: boolean }
): Promise<void> {
  const sub = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
  if (!sub) return;

  if (!options?.force && sub.nameRu && String(sub.nameRu).trim()) return;
  if (!sub.name?.trim()) return;

  const translated = await translateFieldsUkToRu({ name: sub.name });
  if (!translated.name) return;
  await prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { nameRu: translated.name },
  });
}

/** Fire-and-forget; never throws to caller. */
export function scheduleProductRuSync(productId: number, force = true) {
  void syncProductRuTranslation(productId, { force }).catch((e) =>
    console.error(`[syncProductRu] #${productId}`, e)
  );
}

export function scheduleCategoryRuSync(categoryId: number, force = true) {
  void syncCategoryRuTranslation(categoryId, { force }).catch((e) =>
    console.error(`[syncCategoryRu] #${categoryId}`, e)
  );
}

export function scheduleSubcategoryRuSync(subcategoryId: number, force = true) {
  void syncSubcategoryRuTranslation(subcategoryId, { force }).catch((e) =>
    console.error(`[syncSubcategoryRu] #${subcategoryId}`, e)
  );
}
