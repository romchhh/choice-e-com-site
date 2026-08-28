"use client";

import { useState } from "react";
import type { CompositionItem } from "@/lib/productComposition";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type CompositionProps = {
  compositionItems: CompositionItem[];
  compositionText?: string | null;
  emptyLabel: string;
};

export function ProductCompositionContent({
  compositionItems,
  compositionText,
  emptyLabel,
}: CompositionProps) {
  const [openIngredient, setOpenIngredient] = useState<number | null>(0);

  if (compositionItems.length > 0) {
    return (
      <div className="space-y-2">
        {compositionItems.map((item, index) => {
          const itemOpen = openIngredient === index;
          return (
            <div
              key={`${item.name}-${index}`}
              className="rounded-xl border border-[#3D1A00]/10 bg-[#FFF9F0]/50"
            >
              <button
                type="button"
                onClick={() => setOpenIngredient(itemOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={itemOpen}
              >
                <span className="font-['Montserrat'] text-sm font-medium text-[#3D1A00] md:text-base">
                  {item.name}
                </span>
                <Chevron open={itemOpen} />
              </button>
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
                  itemOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {item.description ? (
                  <p className="px-4 pb-4 font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/80 whitespace-pre-line md:text-base">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (compositionText?.trim()) {
    return (
      <p className="font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/85 whitespace-pre-line md:text-base">
        {compositionText}
      </p>
    );
  }

  return (
    <p className="font-['Montserrat'] text-sm text-[#3D1A00]/70">{emptyLabel}</p>
  );
}

export function ProductTextTabContent({ text }: { text?: string | null }) {
  if (!text?.trim()) return null;
  return (
    <div className="font-['Montserrat'] text-sm font-normal leading-[1.7] tracking-[-0.02em] text-[#3D1A00]/90 whitespace-pre-line md:text-base">
      {text}
    </div>
  );
}
