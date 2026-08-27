"use client";

import { useMemo, useState } from "react";
import {
  COURSE_MONTH_OPTIONS,
  DEFAULT_COURSE_MONTHS,
  packsForProgramMonths,
  resolvePackDays,
} from "@/lib/courseCalculator";

type Labels = {
  title: string;
  months: string;
  packOne: string;
  packFew: string;
  packMany: string;
  addCourse: string;
  uah: string;
  daysPerPack: string;
};

type Props = {
  courseText?: string | null;
  courseDays?: number | null;
  unitPrice: number;
  labels: Labels;
  disabled?: boolean;
  onAddCourse: (packs: number) => void;
  embedded?: boolean;
};

function packWord(n: number, labels: Labels): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return labels.packOne;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return labels.packFew;
  }
  return labels.packMany;
}

export default function ProductCourseCalculator({
  courseText,
  courseDays,
  unitPrice,
  labels,
  disabled,
  onAddCourse,
  embedded = false,
}: Props) {
  const packDays = useMemo(
    () => resolvePackDays(courseDays, courseText),
    [courseDays, courseText]
  );

  const [months, setMonths] = useState<number>(DEFAULT_COURSE_MONTHS);

  if (!packDays) return null;

  const packs = packsForProgramMonths(packDays, months);
  const total = Math.round(unitPrice * packs);

  return (
    <div
      className={
        embedded
          ? "space-y-4"
          : "rounded-2xl border border-[#D7D799]/70 bg-gradient-to-br from-[#F4F6EC] via-[#FAFBF4] to-white p-4 shadow-[0_2px_12px_rgba(61,26,0,0.04)] sm:p-5"
      }
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[#4A5530]" aria-hidden>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-['Montserrat'] text-sm font-semibold text-[#3D1A00] sm:text-[15px]">
            {labels.title}
          </p>
          <p className="mt-0.5 font-['Montserrat'] text-xs text-[#5F6B2E] sm:text-sm">
            {labels.daysPerPack.replace("{days}", String(packDays))}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {COURSE_MONTH_OPTIONS.map((m) => {
          const active = months === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMonths(m)}
              className={`rounded-full px-3.5 py-2 font-['Montserrat'] text-xs font-semibold transition-all sm:text-sm ${
                active
                  ? "bg-[#3D1A00] text-white shadow-sm"
                  : "border border-[#3D1A00]/12 bg-white text-[#3D1A00] hover:border-[#8B9A47]/50 hover:bg-[#F4F6EC]"
              }`}
            >
              {m} {labels.months}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/80 bg-white/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="font-['Montserrat'] text-sm text-[#3D1A00]">
          <span className="text-lg font-semibold sm:text-xl">
            {total.toLocaleString("uk-UA")} {labels.uah}
          </span>
          <span className="mt-0.5 block text-xs text-[#3D1A00]/55 sm:mt-0 sm:inline sm:pl-1.5">
            · {packs} {packWord(packs, labels)}
          </span>
        </p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddCourse(packs)}
          className="w-full shrink-0 rounded-full bg-[#8B9A47] px-5 py-2.5 font-['Montserrat'] text-sm font-semibold text-white transition-colors hover:bg-[#7a8940] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {labels.addCourse}
        </button>
      </div>
    </div>
  );
}
