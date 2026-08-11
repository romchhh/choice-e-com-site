"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const FEATURE_ICONS = [
  "/images/choice-features/original-product.png",
  "/images/choice-features/health-care-home.png",
  "/images/choice-features/plant-formulas.png",
  "/images/choice-features/official-badge.png",
  "/images/choice-features/consultation.png",
];

export default function FeaturesSection() {
  const { dict } = useLocale();
  const features = dict.home.features.map((text, index) => ({
    icon: FEATURE_ICONS[index] || FEATURE_ICONS[0],
    text,
  }));

  return (
    <section className="w-full bg-white border-y border-[#fce4ec]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]"
            >
              <div className="relative w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0">
                <Image
                  src={item.icon}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <p className="text-[#3D1A00] font-['Montserrat'] font-normal text-xs lg:text-sm leading-tight uppercase text-left">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
