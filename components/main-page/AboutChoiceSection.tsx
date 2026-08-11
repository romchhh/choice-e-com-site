"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AboutChoiceSection() {
  const { dict } = useLocale();

  return (
    <section className="w-full bg-[#FFF9F0]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <div className="flex flex-col gap-6 text-left">
            <p
              className="text-[#3D1A00] font-['Montserrat'] font-normal text-[18px] leading-[1.55] lg:text-[32px] lg:leading-[2.3] uppercase"
              style={{ letterSpacing: "-0.02em" }}
            >
              {dict.home.aboutChoiceLead}
            </p>
            <p
              className="text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] text-left"
              style={{ letterSpacing: "-0.02em" }}
            >
              {dict.home.aboutChoiceIncludes}
            </p>
            <ul
              className="list-disc list-inside text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] space-y-2 text-left"
              style={{ letterSpacing: "-0.02em" }}
            >
              {dict.home.aboutChoiceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p
              className="text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] text-left"
              style={{ letterSpacing: "-0.02em" }}
            >
              {dict.home.aboutChoiceFooter}
            </p>
          </div>

          <div className="relative w-full min-h-[280px] lg:min-h-0 aspect-[4/3] lg:aspect-auto lg:h-full rounded-lg overflow-hidden bg-gray-200">
            <Image
              src="/images/choice-features/hf_20260307_215108_06a12bac-5d12-49df-91f4-d239d4ced1b7.png"
              alt="CHOICE — eco-wellness"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
