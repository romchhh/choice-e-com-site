import type { Locale } from "@/lib/i18n/config";

function pick(ua: string | null | undefined, ru: string | null | undefined, locale: Locale): string | null | undefined {
  if (locale === "ru" && ru != null && String(ru).trim() !== "") return ru;
  return ua;
}

/** Overlay RU text fields onto primary display fields for storefront. */
export function localizeProductFields<T extends Record<string, any>>(
  product: T,
  locale: Locale
): T {
  if (locale !== "ru" || !product) return product;

  return {
    ...product,
    name: pick(product.name, product.name_ru ?? product.nameRu, locale) ?? product.name,
    subtitle: pick(product.subtitle, product.subtitle_ru ?? product.subtitleRu, locale) ?? product.subtitle,
    release_form: pick(product.release_form ?? product.releaseForm, product.release_form_ru ?? product.releaseFormRu, locale),
    course: pick(product.course, product.course_ru ?? product.courseRu, locale),
    package_weight: pick(product.package_weight ?? product.packageWeight, product.package_weight_ru ?? product.packageWeightRu, locale),
    main_info: pick(product.main_info ?? product.mainInfo, product.main_info_ru ?? product.mainInfoRu, locale),
    short_description: pick(product.short_description ?? product.shortDescription, product.short_description_ru ?? product.shortDescriptionRu, locale),
    description: pick(product.description, product.description_ru ?? product.descriptionRu, locale),
    main_action: pick(product.main_action ?? product.mainAction, product.main_action_ru ?? product.mainActionRu, locale),
    indications_for_use: pick(product.indications_for_use ?? product.indicationsForUse, product.indications_for_use_ru ?? product.indicationsForUseRu, locale),
    benefits: pick(product.benefits, product.benefits_ru ?? product.benefitsRu, locale),
    full_composition: pick(product.full_composition ?? product.fullComposition, product.full_composition_ru ?? product.fullCompositionRu, locale),
    usage_method: pick(product.usage_method ?? product.usageMethod, product.usage_method_ru ?? product.usageMethodRu, locale),
    contraindications: pick(product.contraindications, product.contraindications_ru ?? product.contraindicationsRu, locale),
    storage_conditions: pick(product.storage_conditions ?? product.storageConditions, product.storage_conditions_ru ?? product.storageConditionsRu, locale),
    fabric_composition: pick(product.fabric_composition ?? product.fabricComposition, product.fabric_composition_ru ?? product.fabricCompositionRu, locale),
    lining_description: pick(product.lining_description ?? product.liningDescription, product.lining_description_ru ?? product.liningDescriptionRu, locale),
    category_name: pick(product.category_name, product.category_name_ru, locale) ?? product.category_name,
    subcategory_name: pick(product.subcategory_name, product.subcategory_name_ru, locale) ?? product.subcategory_name,
    category_description: pick(product.category_description, product.category_description_ru, locale) ?? product.category_description,
  };
}

export function localizeCategoryFields<T extends Record<string, any>>(
  category: T,
  locale: Locale
): T {
  if (locale !== "ru" || !category) return category;
  return {
    ...category,
    name: pick(category.name, category.name_ru ?? category.nameRu, locale) ?? category.name,
    description: pick(category.description, category.description_ru ?? category.descriptionRu, locale),
  };
}

export function localizeSubcategoryFields<T extends Record<string, any>>(
  sub: T,
  locale: Locale
): T {
  if (locale !== "ru" || !sub) return sub;
  return {
    ...sub,
    name: pick(sub.name, sub.name_ru ?? sub.nameRu, locale) ?? sub.name,
  };
}

export function localizeList<T extends Record<string, any>>(
  items: T[],
  locale: Locale,
  kind: "product" | "category" | "subcategory" = "product"
): T[] {
  if (locale !== "ru") return items;
  return items.map((item) => {
    if (kind === "category") return localizeCategoryFields(item, locale);
    if (kind === "subcategory") return localizeSubcategoryFields(item, locale);
    return localizeProductFields(item, locale);
  });
}
