-- Плашка «Безкоштовно DOCTOR CHOICE» на товарі
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "doctor_choice_badge" BOOLEAN NOT NULL DEFAULT false;
