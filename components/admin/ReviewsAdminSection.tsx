"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import ComponentCard from "@/components/admin/ComponentCard";
import Input from "@/components/admin/form/input/InputField";
import Label from "@/components/admin/form/Label";
import TextArea from "@/components/admin/form/input/TextArea";
import type { ReviewDTO } from "@/lib/reviews";
import { resolveReviewPhotoSrc } from "@/lib/reviews";

type ProductOption = { id: number; name: string };

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "text-base" : "text-2xl";
  return (
    <div className={`flex gap-0.5 ${cls}`} role={onChange ? "radiogroup" : undefined}>
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

export default function ReviewsAdminSection() {
  const [list, setList] = useState<ReviewDTO[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">(
    "pending"
  );
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    author_name: "",
    text: "",
    rating: 5,
    photo_url: "",
    product_id: "",
    show_on_home: true,
    approve: true,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/products?limit=200");
        const data = await res.json();
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];
        setProducts(
          arr.map((p: { id: number; name: string }) => ({
            id: p.id,
            name: p.name,
          }))
        );
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
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
          product_id: form.product_id ? Number(form.product_id) : null,
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
      setForm({
        author_name: "",
        text: "",
        rating: 5,
        photo_url: "",
        product_id: "",
        show_on_home: true,
        approve: true,
      });
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
      setMessage({
        type: "success",
        text:
          action === "approve"
            ? "Підтверджено"
            : action === "reject"
              ? "Відхилено"
              : "Видалено",
      });
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

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-700",
    };
    const label: Record<string, string> = {
      pending: "На модерації",
      approved: "Підтверджено",
      rejected: "Відхилено",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
          map[s] || "bg-gray-100"
        }`}
      >
        {label[s] || s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <ComponentCard title="Додати відгук">
        <form onSubmit={handleCreate} className="space-y-4">
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <Label>Товар (опційно)</Label>
              <select
                value={form.product_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, product_id: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">— Без прив&apos;язки —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} · {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Оцінка</Label>
            <Stars
              value={form.rating}
              onChange={(n) => setForm((f) => ({ ...f, rating: n }))}
            />
          </div>

          <div>
            <Label>Текст відгуку *</Label>
            <TextArea
              value={form.text}
              onChange={(v) => setForm((f) => ({ ...f, text: v }))}
              rows={4}
            />
          </div>

          <div>
            <Label>Фото відгуку</Label>
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
            {form.photo_url && (
              <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={resolveReviewPhotoSrc(form.photo_url) || ""}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
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
              Показувати на головній
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="rounded-lg bg-[#3D1A00] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Збереження…" : "Додати відгук"}
          </button>
        </form>
      </ComponentCard>

      <ComponentCard title="Модерація відгуків">
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["pending", "На модерації"],
              ["approved", "Підтверджені"],
              ["rejected", "Відхилені"],
              ["all", "Усі"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === key
                  ? "bg-[#3D1A00] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Завантаження…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">Немає відгуків у цій категорії.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((r) => {
              const photo = resolveReviewPhotoSrc(r.photo_url);
              return (
                <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row">
                  {photo ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={photo}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {r.author_name}
                      </span>
                      {statusBadge(r.status)}
                      <Stars value={r.rating} size="sm" />
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {r.text}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {r.product_name
                        ? `Товар: ${r.product_name}`
                        : "Без товару"}
                      {" · "}
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
    </div>
  );
}
