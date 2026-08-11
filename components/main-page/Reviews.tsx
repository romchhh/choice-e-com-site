"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Reviews() {
  const { dict } = useLocale();
  return (
    <section
      id="reviews"
      className="scroll-mt-5 max-w-[1920px] w-full mx-auto relative bg-[var(--background-warm-yellow)] px-6 py-16 lg:py-24"
    >
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 lg:gap-16">
        <div>
          <h2 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black leading-tight mb-6">
            {dict.home.reviewsTitle}
          </h2>
        </div>

        <div className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
          {dict.home.reviews.moreBefore}{" "}
          <Link
            href="https://www.instagram.com/my_choice_mari"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black transition-colors"
          >
            Instagram
          </Link>{" "}
          {dict.home.reviews.moreAfter}
        </div>
      </div>
    </section>
  );
}
