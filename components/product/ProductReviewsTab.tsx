"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import ImageLightbox from "@/components/shared/ImageLightbox";
import ProductReviewForm from "@/components/reviews/ProductReviewForm";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

type Props = {
  productId: number;
};

export default function ProductReviewsTab({ productId }: Props) {
  const { dict } = useLocale();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (cancelled) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setSummary(
          data.summary && typeof data.summary === "object"
            ? {
                average: Number(data.summary.average) || 0,
                count: Number(data.summary.count) || 0,
              }
            : { average: 0, count: 0 }
        );
      } catch {
        if (!cancelled) {
          setReviews([]);
          setSummary({ average: 0, count: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <section
      className="mt-16 border-t border-[#3D1A00]/10 pt-10 lg:mt-20 lg:pt-14"
      aria-labelledby="product-reviews-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="product-reviews-heading"
            className="font-['Montserrat'] text-xl font-bold uppercase tracking-tight text-[#3D1A00] md:text-2xl"
          >
            {dict.product.tabs.reviews}
          </h2>
          {!loading && summary.count > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={summary.average} size="md" />
              <span className="font-['Montserrat'] text-sm text-[#3D1A00]/70">
                {summary.average.toFixed(1)} ·{" "}
                {dict.reviews.countLabel.replace("{n}", String(summary.count))}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="mt-6 font-['Montserrat'] text-sm text-[#3D1A00]/60">
          {dict.common.loading}
        </p>
      ) : summary.count === 0 ? (
        <p className="mt-6 font-['Montserrat'] text-sm text-[#3D1A00]/70">
          {dict.reviews.emptyProduct}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-[#3D1A00]/10">
          {reviews.map((r) => {
            const photo = resolveReviewPhotoSrc(r.photo_url);
            return (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-['Montserrat'] text-sm font-semibold text-[#3D1A00]">
                    {r.author_name}
                  </span>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <p className="mt-2 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/85 whitespace-pre-line md:text-[15px]">
                  {r.text}
                </p>
                {photo ? (
                  <button
                    type="button"
                    onClick={() => setLightboxSrc(photo)}
                    className="relative mt-4 block aspect-[4/3] w-full max-w-[220px] overflow-hidden text-left transition-opacity hover:opacity-90"
                    aria-label={dict.reviews.openPhoto}
                  >
                    <Image
                      src={photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <ProductReviewForm productId={productId} />

      <ImageLightbox
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </section>
  );
}
