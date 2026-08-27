"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type Props = {
  /** Single image (reviews) or omit when using `images` */
  src?: string | null;
  /** Gallery of image URLs */
  images?: string[] | null;
  startIndex?: number;
  alt?: string;
  onClose: () => void;
};

export default function ImageLightbox({
  src = null,
  images = null,
  startIndex = 0,
  alt = "",
  onClose,
}: Props) {
  const gallery =
    images && images.length > 0
      ? images
      : src
        ? [src]
        : [];
  const open = gallery.length > 0;
  const [index, setIndex] = useState(startIndex);
  const [touchX, setTouchX] = useState<number | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setIndex(Math.min(Math.max(0, startIndex), gallery.length - 1));
  }, [open, startIndex, gallery.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (gallery.length < 2) return;
      if (e.key === "ArrowLeft") {
        setIndex((i) => (i > 0 ? i - 1 : gallery.length - 1));
      }
      if (e.key === "ArrowRight") {
        setIndex((i) => (i < gallery.length - 1 ? i + 1 : 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, gallery.length, onClose]);

  if (!open) return null;

  const current = gallery[Math.min(index, gallery.length - 1)];
  const hasMany = gallery.length > 1;

  const goPrev = () =>
    setIndex((i) => (i > 0 ? i - 1 : gallery.length - 1));
  const goNext = () =>
    setIndex((i) => (i < gallery.length - 1 ? i + 1 : 0));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Фото"}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[102] flex h-10 w-10 items-center justify-center font-['Montserrat'] text-lg text-white/90 hover:text-white sm:right-5 sm:top-5"
        aria-label="Закрити"
      >
        ✕
      </button>

      {hasMany && (
        <p className="absolute left-1/2 top-4 z-[102] -translate-x-1/2 font-['Montserrat'] text-sm text-white/80">
          {index + 1} / {gallery.length}
        </p>
      )}

      {hasMany && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-2 z-[102] flex h-11 w-11 items-center justify-center text-2xl text-white/85 hover:text-white sm:left-4"
          aria-label="Попереднє фото"
        >
          ‹
        </button>
      )}

      {hasMany && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-2 z-[102] flex h-11 w-11 items-center justify-center text-2xl text-white/85 hover:text-white sm:right-4"
          aria-label="Наступне фото"
        >
          ›
        </button>
      )}

      <div
        className="relative flex h-full w-full max-h-[92vh] max-w-6xl items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          setTouchX(e.touches[0]?.clientX ?? null);
        }}
        onTouchEnd={(e) => {
          if (touchX == null || !hasMany) return;
          const endX = e.changedTouches[0]?.clientX ?? touchX;
          const delta = endX - touchX;
          setTouchX(null);
          if (Math.abs(delta) < 50) return;
          if (delta < 0) goNext();
          else goPrev();
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src={current}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
