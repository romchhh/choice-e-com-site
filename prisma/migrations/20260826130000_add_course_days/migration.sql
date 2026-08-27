-- Explicit pack duration in days for course calculator (fallback: parse from course text)
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "course_days" INTEGER;
