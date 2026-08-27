"use client";

import { useState } from "react";
import type { CompositionItem } from "@/lib/productComposition";

type SectionId = "composition" | "usage" | "effect";

type Props = {
  labels: {
    composition: string;
    usage: string;
    effect: string;
    empty: string;
  };
  compositionItems: CompositionItem[];
  compositionText?: string | null;
  usageText?: string | null;
  effectText?: string | null;
};

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

export default function ProductDetailsAccordion({
  labels,
  compositionItems,
  compositionText,
  usageText,
  effectText,
}: Props) {
  const hasComposition =
    compositionItems.length > 0 ||
    Boolean(compositionText && compositionText.trim());
  const hasUsage = Boolean(usageText && usageText.trim());
  const hasEffect = Boolean(effectText && effectText.trim());

  if (!hasComposition && !hasUsage && !hasEffect) return null;

  const sections: Array<{
    id: SectionId;
    title: string;
    available: boolean;
  }> = (
    [
      { id: "composition" as const, title: labels.composition, available: hasComposition },
      { id: "usage" as const, title: labels.usage, available: hasUsage },
      { id: "effect" as const, title: labels.effect, available: hasEffect },
    ] as const
  ).filter((s) => s.available);

  const [openSection, setOpenSection] = useState<SectionId | null>(
    sections[0]?.id ?? null
  );
  const [openIngredient, setOpenIngredient] = useState<number | null>(0);

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="mt-10 border-t border-[#3D1A00]/10 pt-8">
      <div className="divide-y divide-[#3D1A00]/10 border-y border-[#3D1A00]/10">
        {sections.map((section) => {
          const open = openSection === section.id;
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={open}
              >
                <span className="font-['Montserrat'] text-sm font-semibold uppercase tracking-[0.08em] text-[#3D1A00] md:text-base">
                  {section.title}
                </span>
                <Chevron open={open} />
              </button>

              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                  open ? "max-h-[2000px] opacity-100 pb-5" : "max-h-0 opacity-0"
                }`}
              >
                {section.id === "composition" && (
                  <div className="space-y-2">
                    {compositionItems.length > 0 ? (
                      compositionItems.map((item, index) => {
                        const itemOpen = openIngredient === index;
                        return (
                          <div
                            key={`${item.name}-${index}`}
                            className="rounded-xl border border-[#3D1A00]/10 bg-[#FFF9F0]/50"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenIngredient(itemOpen ? null : index)
                              }
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
                                itemOpen
                                  ? "max-h-[800px] opacity-100"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              {item.description ? (
                                <p className="px-4 pb-4 font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/80 whitespace-pre-line">
                                  {item.description}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    ) : compositionText ? (
                      <p className="font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/85 whitespace-pre-line md:text-base">
                        {compositionText}
                      </p>
                    ) : (
                      <p className="text-sm text-[#3D1A00]/60">{labels.empty}</p>
                    )}
                  </div>
                )}

                {section.id === "usage" && (
                  <p className="font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/85 whitespace-pre-line md:text-base">
                    {usageText}
                  </p>
                )}

                {section.id === "effect" && (
                  <p className="font-['Montserrat'] text-sm leading-[1.7] text-[#3D1A00]/85 whitespace-pre-line md:text-base">
                    {effectText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
