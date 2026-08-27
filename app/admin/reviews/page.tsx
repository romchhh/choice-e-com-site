import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ReviewsAdminSection from "@/components/admin/ReviewsAdminSection";

export const dynamic = "force-dynamic";

export default function AdminReviewsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Відгуки" />
      <div className="mt-4">
        <ReviewsAdminSection />
      </div>
    </div>
  );
}
