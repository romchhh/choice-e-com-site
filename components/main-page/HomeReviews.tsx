"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import ImageLightbox from "@/components/shared/ImageLightbox";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

const CARD_WIDTH = "minmax(280px, 320px)";
const SKELETON_COUNT = 8;

function ReviewCard({
  review,
  onPhotoClick,
}: {
  review: ReviewDTO;
  onPhotoClick: (src: string) => void;
}) {
  const { dict } = useLocale();
  const photo = resolveReviewPhotoSrc(review.photo_url);

  return (
    <li className="flex h-full min-h-[220px] flex-col rounded-2xl bg-white p-5 sm:min-h-[240px] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <StarRating rating={review.rating} size="sm" />
          <p className="mt-2 font-['Montserrat'] text-base font-semibold text-[#3D1A00]">
            {review.author_name}
          </p>
        </div>
        {photo ? (
          <button
            type="button"
            onClick={() => onPhotoClick(photo)}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl transition-opacity hover:opacity-90"
            aria-label={dict.reviews.openPhoto}
          >
            <Image
              src={photo}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
            />
          </button>
        ) : null}
      </div>

      <p className="mt-3 flex-1 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/80 line-clamp-5 sm:text-[15px] sm:leading-[1.6]">
        {review.text}
      </p>

      {review.product_name ? (
        <div className="mt-4 border-t border-[#3D1A00]/08 pt-3">
          <p className="font-['Montserrat'] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3D1A00]/40">
            {dict.reviews.productLabel}
          </p>
          {review.product_slug ? (
            <LocaleLink
              href={`/product/${review.product_slug}`}
              className="mt-1 block font-['Montserrat'] text-sm font-medium leading-snug text-[#8B9A47] transition-opacity hover:opacity-80"
            >
              <span className="line-clamp-2">{review.product_name}</span>
            </LocaleLink>
          ) : (
            <p className="mt-1 font-['Montserrat'] text-sm leading-snug text-[#3D1A00]/55 line-clamp-2">
              {review.product_name}
            </p>
          )}
        </div>
      ) : null}
    </li>
  );
}

export default function HomeReviews() {
  const { dict } = useLocale();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/reviews?home=1");
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setReviews(data);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section
      id="reviews"
      className="w-full scroll-mt-8 border-y border-[#3D1A00]/10 bg-[#FFF9F0] py-12 lg:py-16"
      aria-labelledby="home-reviews-heading"
    >
      <div className="mx-auto max-w-[1920px] px-5 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2
              id="home-reviews-heading"
              className="font-['Montserrat'] text-2xl font-bold uppercase tracking-tight text-[#3D1A00] lg:text-3xl"
            >
              {dict.home.reviewsTitle}
            </h2>
            <p className="mt-2 font-['Montserrat'] text-sm text-[#3D1A00]/70 md:text-base">
              {dict.home.reviewsLead}
            </p>
          </div>
          {!loading && reviews.length > 0 ? (
            <p className="font-['Montserrat'] text-sm text-[#3D1A00]/45">
              {dict.reviews.countLabel.replace("{n}", String(reviews.length))}
            </p>
          ) : null}
        </div>

        <div className="mt-8 -mx-5 overflow-x-auto px-5 pb-2 scrollbar-hide sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          {loading ? (
            <ul
              className="grid w-max grid-flow-col grid-rows-2 gap-4"
              style={{ gridAutoColumns: CARD_WIDTH }}
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <li
                  key={i}
                  className="h-[220px] animate-pulse rounded-2xl bg-[#F3EEE4] sm:h-[240px]"
                />
              ))}
            </ul>
          ) : (
            <ul
              className="grid w-max grid-flow-col grid-rows-2 gap-4"
              style={{ gridAutoColumns: CARD_WIDTH }}
            >
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onPhotoClick={setLightboxSrc}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </section>
  );
}
