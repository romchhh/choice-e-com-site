import type { Metadata } from "next";
import ReviewFormClient from "@/components/reviews/ReviewFormClient";

export const metadata: Metadata = {
  title: "Оставить отзыв | ForBody Space",
  robots: { index: false, follow: false },
};

export default function ReviewPageRu() {
  return (
    <main className="min-h-[70vh] bg-[#FFF9F0] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-lg px-6 sm:px-8">
        <ReviewFormClient />
      </div>
    </main>
  );
}
