-- AlterTable categories
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "name_ru" TEXT;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "description_ru" TEXT;

-- AlterTable subcategories
ALTER TABLE "subcategories" ADD COLUMN IF NOT EXISTS "name_ru" TEXT;

-- AlterTable products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subtitle_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "release_form_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "course_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "package_weight_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "main_info_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "short_description_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "main_action_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "indications_for_use_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "benefits_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "full_composition_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "usage_method_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "contraindications_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "storage_conditions_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fabric_composition_ru" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "lining_description_ru" TEXT;
