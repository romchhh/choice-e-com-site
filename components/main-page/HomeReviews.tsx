"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import ImageLightbox from "@/components/shared/ImageLightbox";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

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
      className="w-full scroll-mt-8 bg-[#FFF9F0] py-12 lg:py-16"
      aria-labelledby="home-reviews-heading"
    >
      <div className="mx-auto max-w-[1920px] px-6 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="home-reviews-heading"
              className="font-['Montserrat'] text-2xl font-bold uppercase tracking-tight text-[#3D1A00] lg:text-3xl"
            >
              {dict.home.reviewsTitle}
            </h2>
            <p className="mt-2 max-w-xl font-['Montserrat'] text-sm text-[#3D1A00]/70 md:text-base">
              {dict.home.reviewsLead}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-[#E8DED0]/50"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => {
              const photo = resolveReviewPhotoSrc(r.photo_url);
              return (
                <article
                  key={r.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#E8DED0]/80 bg-white shadow-sm"
                >
                  {photo ? (
                    <button
                      type="button"
                      onClick={() => setLightboxSrc(photo)}
                      className="relative aspect-[4/3] w-full bg-gray-100 text-left transition-opacity hover:opacity-90"
                      aria-label={dict.reviews.openPhoto}
                    >
                      <Image
                        src={photo}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </button>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                    <StarRating rating={r.rating} size="sm" />
                    <p className="flex-1 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/90 whitespace-pre-line line-clamp-5">
                      {r.text}
                    </p>
                    <div className="mt-auto pt-2">
                      <p className="font-['Montserrat'] text-sm font-semibold text-[#3D1A00]">
                        {r.author_name}
                      </p>
                      {r.product_name && r.product_slug ? (
                        <LocaleLink
                          href={`/product/${r.product_slug}`}
                          className="mt-0.5 inline-block font-['Montserrat'] text-xs text-[#8B9A47] hover:underline"
                        >
                          {r.product_name}
                        </LocaleLink>
                      ) : r.product_name ? (
                        <p className="mt-0.5 font-['Montserrat'] text-xs text-[#3D1A00]/55">
                          {r.product_name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ImageLightbox
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </section>
  );
}
