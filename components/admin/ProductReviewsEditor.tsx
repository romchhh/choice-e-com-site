"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import ComponentCard from "@/components/admin/ComponentCard";
import Input from "@/components/admin/form/input/InputField";
import Label from "@/components/admin/form/Label";
import TextArea from "@/components/admin/form/input/TextArea";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

type Props = {
  productId: number;
  productName?: string;
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="flex gap-0.5 text-xl" role={onChange ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`leading-none ${
            n <= value ? "text-amber-500" : "text-gray-300"
          } ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          aria-label={`${n} зірок`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviewsEditor({ productId, productName }: Props) {
  const [list, setList] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    author_name: "",
    text: "",
    rating: 5,
    photo_url: "",
    show_on_home: true,
    approve: true,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reviews?status=all&productId=${productId}`
      );
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const resetForm = () => {
    setForm({
      author_name: "",
      text: "",
      rating: 5,
      photo_url: "",
      show_on_home: true,
      approve: true,
    });
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("images", file);
      const res = await fetch("/api/images", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      const url = data.media?.[0]?.url;
      if (url) setForm((f) => ({ ...f, photo_url: url }));
    } catch {
      setMessage({ type: "error", text: "Не вдалося завантажити фото" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: form.author_name,
          text: form.text,
          rating: form.rating,
          photo_url: form.photo_url || null,
          product_id: productId,
          show_on_home: form.show_on_home,
          approve: form.approve,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Помилка" });
        return;
      }
      setMessage({ type: "success", text: "Відгук додано" });
      resetForm();
      setShowForm(false);
      await fetchList();
    } catch {
      setMessage({ type: "error", text: "Помилка мережі" });
    } finally {
      setSubmitting(false);
    }
  };

  const moderate = async (
    id: number,
    action: "approve" | "reject" | "delete",
    extra?: { show_on_home?: boolean }
  ) => {
    if (action === "delete" && !confirm("Видалити відгук?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: action === "delete" ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body:
          action === "delete"
            ? undefined
            : JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error || "Помилка" });
        return;
      }
      await fetchList();
    } catch {
      setMessage({ type: "error", text: "Помилка мережі" });
    }
  };

  const toggleHome = async (review: ReviewDTO) => {
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        show_on_home: !review.show_on_home,
      }),
    });
    await fetchList();
  };

  const statusLabel: Record<string, string> = {
    pending: "На модерації",
    approved: "Підтверджено",
    rejected: "Відхилено",
  };

  const photoPreview = resolveReviewPhotoSrc(form.photo_url);

  return (
    <ComponentCard
      title={`Відгуки${productName ? ` · ${productName}` : ""}`}
      className="mt-4 sm:mt-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {loading
            ? "Завантаження…"
            : list.length === 0
              ? "Поки немає відгуків для цього товару"
              : `Усього: ${list.length}`}
        </p>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setMessage(null);
          }}
          className="rounded-lg bg-[#3D1A00] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {showForm ? "Сховати форму" : "Додати відгук"}
        </button>
      </div>

      {message && (
        <p
          className={`mb-3 text-sm ${
            message.type === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 space-y-3 border-b border-gray-100 pb-6"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Ім&apos;я *</Label>
              <Input
                value={form.author_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author_name: e.target.value }))
                }
                placeholder="Марія"
              />
            </div>
            <div>
              <Label>Оцінка</Label>
              <Stars
                value={form.rating}
                onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
              />
            </div>
          </div>

          <div>
            <Label>Текст відгуку *</Label>
            <TextArea
              value={form.text}
              onChange={(v) => setForm((f) => ({ ...f, text: v }))}
              rows={3}
            />
          </div>

          <div>
            <Label>Фото</Label>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
              className="block w-full text-sm"
            />
            {photoPreview && (
              <div className="relative mt-2 h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={photoPreview}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.approve}
                onChange={(e) =>
                  setForm((f) => ({ ...f, approve: e.target.checked }))
                }
              />
              Одразу підтвердити
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.show_on_home}
                onChange={(e) =>
                  setForm((f) => ({ ...f, show_on_home: e.target.checked }))
                }
              />
              На головній
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Збереження…" : "Зберегти відгук"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Завантаження…</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">Список порожній.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {list.map((r) => {
            const photo = resolveReviewPhotoSrc(r.photo_url);
            return (
              <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row">
                {photo ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={photo}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {r.author_name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-700">
                      {statusLabel[r.status] || r.status}
                    </span>
                    <Stars value={r.rating} />
                  </div>
                  <p className="whitespace-pre-line text-sm text-gray-800">
                    {r.text}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString("uk-UA")}
                    {r.show_on_home ? " · на головній" : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          void moderate(r.id, "approve", {
                            show_on_home: true,
                          })
                        }
                        className="rounded border border-green-300 px-2.5 py-1 text-xs text-green-700"
                      >
                        Підтвердити
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => void moderate(r.id, "reject")}
                        className="rounded border border-amber-300 px-2.5 py-1 text-xs text-amber-800"
                      >
                        Відхилити
                      </button>
                    )}
                    {r.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => void toggleHome(r)}
                        className="rounded border border-gray-300 px-2.5 py-1 text-xs"
                      >
                        {r.show_on_home
                          ? "Прибрати з головної"
                          : "На головну"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void moderate(r.id, "delete")}
                      className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ComponentCard>
  );
}
