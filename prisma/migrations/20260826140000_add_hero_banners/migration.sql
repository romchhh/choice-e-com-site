-- Admin-managed homepage hero promo slides
CREATE TABLE IF NOT EXISTS "hero_banners" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "title_ru" TEXT,
  "subtitle" TEXT,
  "subtitle_ru" TEXT,
  "badge" TEXT,
  "badge_ru" TEXT,
  "benefit_text" TEXT,
  "benefit_text_ru" TEXT,
  "price_label" TEXT,
  "price_label_ru" TEXT,
  "cta_label" TEXT NOT NULL DEFAULT 'Купити',
  "cta_label_ru" TEXT,
  "href" TEXT NOT NULL DEFAULT '/catalog',
  "image_url" TEXT NOT NULL,
  "image_url_mobile" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "starts_at" TIMESTAMP(3),
  "ends_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "hero_banners_is_active_sort_order_idx"
  ON "hero_banners" ("is_active", "sort_order");
