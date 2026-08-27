"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import StarRating from "@/components/shared/StarRating";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

type ProductOpt = { id: number; name: string; slug: string | null };

function ReviewFormInner() {
  const { dict } = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [loading, setLoading] = useState(!!token);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [email, setEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    author_name: "",
    author_email: "",
    product_id: "",
    rating: 5,
    text: "",
    photo_url: "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError(dict.reviews.invalidLink);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/reviews/by-token?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || dict.reviews.invalidLink);
          return;
        }
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
        setEmail(data.email || "");
        setCustomerName(data.customer_name || "");
        setForm((f) => ({
          ...f,
          author_name: data.customer_name || "",
          author_email: data.email || "",
          product_id:
            data.products?.[0]?.id != null ? String(data.products[0].id) : "",
        }));
      } catch {
        if (!cancelled) setError(dict.reviews.invalidLink);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, dict.reviews.invalidLink]);

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)) {
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
        fd.append("token", token);
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
    [
      token,
      dict.reviews.uploadError,
      dict.reviews.uploadSizeError,
      dict.reviews.uploadTypeError,
    ]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadPhoto(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          author_name: form.author_name,
          author_email: form.author_email || email,
          product_id: Number(form.product_id),
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
    } catch {
      setError(dict.reviews.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="font-['Montserrat'] text-[#3D1A00]/70">
        {dict.common.loading}
      </p>
    );
  }

  if (success) {
    return (
      <div>
        <h1 className="font-['Montserrat'] text-2xl font-bold text-[#3D1A00] sm:text-3xl">
          {dict.reviews.thanksTitle}
        </h1>
        <p className="mt-3 font-['Montserrat'] text-base leading-relaxed text-[#3D1A00]/75">
          {dict.reviews.thanksText}
        </p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <p className="font-['Montserrat'] text-sm text-red-700">{error}</p>
    );
  }

  const photo = resolveReviewPhotoSrc(form.photo_url);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h1 className="font-['Montserrat'] text-2xl font-bold text-[#3D1A00] sm:text-3xl">
          {dict.reviews.formTitle}
        </h1>
        <p className="mt-2 font-['Montserrat'] text-sm leading-relaxed text-[#3D1A00]/70">
          {dict.reviews.formLead}
          {customerName ? (
            <>
              {" "}
              <span className="font-semibold text-[#3D1A00]">
                {customerName}
              </span>
              .
            </>
          ) : null}
        </p>
      </div>

      {error && (
        <p className="font-['Montserrat'] text-sm text-red-700">{error}</p>
      )}

      <div>
        <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.productLabel}
        </label>
        <select
          required
          value={form.product_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, product_id: e.target.value }))
          }
          className="w-full border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
        >
          <option value="">{dict.reviews.productPlaceholder}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.nameLabel}
        </label>
        <input
          required
          value={form.author_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, author_name: e.target.value }))
          }
          className="w-full border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
        />
      </div>

      <div>
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

      <div>
        <label className="mb-1.5 block font-['Montserrat'] text-sm font-medium text-[#3D1A00]">
          {dict.reviews.textLabel}
        </label>
        <textarea
          required
          rows={5}
          minLength={10}
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          className="w-full resize-y border-0 border-b border-[#3D1A00]/25 bg-transparent py-2.5 font-['Montserrat'] text-sm outline-none focus:border-[#3D1A00]"
          placeholder={dict.reviews.textPlaceholder}
        />
      </div>

      <div>
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
            <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden">
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
            onDrop={onDrop}
            className={`flex w-full flex-col items-start gap-1 border-b py-6 text-left transition-colors ${
              dragOver
                ? "border-[#8B9A47]"
                : "border-[#3D1A00]/25 hover:border-[#3D1A00]/50"
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

      <button
        type="submit"
        disabled={submitting || uploading}
        className="inline-flex h-12 items-center justify-center rounded-full bg-[#3D1A00] px-8 font-['Montserrat'] text-sm font-semibold text-[#FFF9F0] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? dict.common.loading : dict.reviews.submit}
      </button>
    </form>
  );
}

export default function ReviewFormClient() {
  return (
    <Suspense
      fallback={
        <p className="font-['Montserrat'] text-[#3D1A00]/70">…</p>
      }
    >
      <ReviewFormInner />
    </Suspense>
  );
}
