"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

type Props = {
  productId: number;
  onSubmitted?: () => void;
};

export default function ProductReviewForm({ productId, onSubmitted }: Props) {
  const { dict } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    rating: 5,
    text: "",
    photo_url: "",
  });

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (
        !file.type.startsWith("image/") &&
        !/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)
      ) {
        setError(dict.reviews.uploadTypeError);
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError(dict.reviews.uploadSizeError);
        return;
      }

      setUploading(true);
      setError(null);
      try {
        const fd = new FormData();
        fd.append("product_id", String(productId));
        fd.append("photo", file);
        const res = await fetch("/api/reviews/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(
            typeof data.error === "string"
              ? data.error
              : dict.reviews.uploadError
          );
          return;
        }
        const url = data.media?.[0]?.url;
        if (!url) {
          setError(dict.reviews.uploadError);
          return;
        }
        setForm((f) => ({ ...f, photo_url: url }));
      } catch {
        setError(dict.reviews.uploadError);
      } finally {
        setUploading(false);
      }
    },
    [productId, dict.reviews.uploadError, dict.reviews.uploadSizeError, dict.reviews.uploadTypeError]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: form.author_name,
          author_email: form.author_email || null,
          product_id: productId,
          rating: form.rating,
          text: form.text,
          photo_url: form.photo_url || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || dict.reviews.submitError);
        return;
      }
      setSuccess(true);
      onSubmitted?.();
    } catch {
      setError(dict.reviews.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mt-8 border-t border-[#3D1A00]/10 pt-8">
        <h3 className="font-['Montserrat'] text-lg font-semibold text-[#3D1A00]">
          {dict.reviews.thanksTitle}
        </h3>
        <p className="mt-2 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/75">
          {dict.reviews.thanksText}
        </p>
      </div>
    );
  }

  const photo = resolveReviewPhotoSrc(form.photo_url);

  if (!open) {
    return (
      <div className="mt-8 border-t border-[#3D1A00]/10 pt-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#3D1A00]/25 bg-transparent px-7 font-['Montserrat'] text-sm font-semibold text-[#3D1A00] transition-colors hover:border-[#3D1A00]/50 hover:bg-[#3D1A00]/[0.04]"
        >
          {dict.reviews.addReview}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 border-t border-[#3D1A00]/10 pt-8"
    >
      <h3 className="font-['Montserrat'] text-lg font-semibold text-[#3D1A00]">
        {dict.reviews.formTitle}
      </h3>
      <p className="mt-1.5 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/70">
        {dict.reviews.formLeadProduct}
      </p>

      {error ? (
        <p className="mt-4 font-['Montserrat'] text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
            {dict.reviews.nameLabel}
          </label>
          <input
            required
            minLength={2}
            value={form.author_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, author_name: e.target.value }))
            }
            className="w-full border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
            Email ({dict.reviews.emailOptional})
          </label>
          <input
            type="email"
            value={form.author_email}
            onChange={(e) =>
              setForm((f) => ({ ...f, author_email: e.target.value }))
            }
            className="w-full border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.ratingLabel}
        </label>
        <StarRating
          rating={form.rating}
          size="lg"
          label={dict.reviews.ratingLabel}
          onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
        />
      </div>

      <div className="mt-5">
        <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.textLabel}
        </label>
        <textarea
          required
          rows={4}
          minLength={10}
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          className="w-full resize-y border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
          placeholder={dict.reviews.textPlaceholder}
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.photoLabel}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.gif,.heic"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadPhoto(file);
            e.target.value = "";
          }}
        />
        {photo ? (
          <div>
            <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-lg">
              <Image
                src={photo}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
              />
            </div>
            <div className="mt-3 flex gap-4">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="font-['Montserrat'] text-sm text-[#3D1A00] underline underline-offset-2 disabled:opacity-50"
              >
                {dict.reviews.photoReplace}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setForm((f) => ({ ...f, photo_url: "" }))}
                className="font-['Montserrat'] text-sm text-[#3D1A00]/60 underline underline-offset-2 disabled:opacity-50"
              >
                {dict.reviews.photoRemove}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadPhoto(file);
            }}
            className={`flex w-full max-w-md flex-col items-start gap-1 rounded-xl border border-dashed px-4 py-5 text-left transition-colors ${
              dragOver
                ? "border-[#8B9A47] bg-[#F4F6EC]/50"
                : "border-[#3D1A00]/20 hover:border-[#3D1A00]/40"
            } disabled:opacity-60`}
          >
            <span className="font-['Montserrat'] text-sm text-[#3D1A00]">
              {uploading
                ? dict.reviews.photoUploading
                : dragOver
                  ? dict.reviews.photoDropActive
                  : dict.reviews.photoDrop}
            </span>
            <span className="font-['Montserrat'] text-xs text-[#3D1A00]/50">
              {dict.reviews.photoHint}
            </span>
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#3D1A00] px-7 font-['Montserrat'] text-sm font-semibold text-[#FFF9F0] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? dict.common.loading : dict.reviews.submit}
        </button>
        <button
          type="button"
          disabled={submitting || uploading}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[#3D1A00]/25 px-7 font-['Montserrat'] text-sm font-medium text-[#3D1A00]/70 transition-colors hover:border-[#3D1A00]/40 hover:text-[#3D1A00] disabled:opacity-50"
        >
          {dict.reviews.hideForm}
        </button>
      </div>
    </form>
  );
}
