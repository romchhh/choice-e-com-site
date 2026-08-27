-- Structured product composition (ingredient name + description), UA + RU
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "composition_items" JSONB;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "composition_items_ru" JSONB;
