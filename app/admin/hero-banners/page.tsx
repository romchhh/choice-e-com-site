import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import HeroBannersSection from "@/components/admin/HeroBannersSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hero-банери | Choice Admin",
  description: "Управління промо-банерами на головній сторінці",
};

export default function AdminHeroBannersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Hero-банери" />
      <div className="space-y-6">
        <p className="text-sm text-gray-600 max-w-2xl">
          Активні банери з фото, текстом і кнопкою ротуються на першому екрані
          головної. Для кожного банера можна завантажити окреме фото для
          комп&apos;ютера (1920×900) і телефону (1080×1920). Якщо жодного
          активного немає — показується стандартний hero.
        </p>
        <HeroBannersSection />
      </div>
    </div>
  );
}
