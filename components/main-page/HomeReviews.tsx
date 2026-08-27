"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LocaleLink from "@/components/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import ImageLightbox from "@/components/shared/ImageLightbox";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

const INITIAL_VISIBLE = 4;

export default function HomeReviews() {
  const { dict } = useLocale();
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
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

  const visible = expanded ? reviews : reviews.slice(0, INITIAL_VISIBLE);
  const canExpand = reviews.length > INITIAL_VISIBLE;

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

        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl bg-[#F3EEE4]"
              />
            ))}
          </div>
        ) : (
          <>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {visible.map((r) => {
                const photo = resolveReviewPhotoSrc(r.photo_url);
                return (
                  <li
                    key={r.id}
                    className="flex flex-col rounded-2xl bg-white p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <StarRating rating={r.rating} size="sm" />
                        <p className="mt-2 font-['Montserrat'] text-base font-semibold text-[#3D1A00]">
                          {r.author_name}
                        </p>
                      </div>
                      {photo ? (
                        <button
                          type="button"
                          onClick={() => setLightboxSrc(photo)}
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
                      {r.text}
                    </p>

                    {r.product_name ? (
                      <div className="mt-4 border-t border-[#3D1A00]/08 pt-3">
                        <p className="font-['Montserrat'] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3D1A00]/40">
                          {dict.reviews.productLabel}
                        </p>
                        {r.product_slug ? (
                          <LocaleLink
                            href={`/product/${r.product_slug}`}
                            className="mt-1 block font-['Montserrat'] text-sm font-medium leading-snug text-[#8B9A47] transition-opacity hover:opacity-80"
                          >
                            <span className="line-clamp-2">{r.product_name}</span>
                          </LocaleLink>
                        ) : (
                          <p className="mt-1 font-['Montserrat'] text-sm leading-snug text-[#3D1A00]/55 line-clamp-2">
                            {r.product_name}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {canExpand ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#3D1A00] px-7 font-['Montserrat'] text-sm font-semibold text-[#3D1A00] transition-colors hover:bg-[#3D1A00]/5"
                >
                  {expanded
                    ? dict.home.reviews.showLess
                    : dict.home.reviews.showAll}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </section>
  );
}
