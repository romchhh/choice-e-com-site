"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import ComponentCard from "@/components/admin/ComponentCard";
import Input from "@/components/admin/form/input/InputField";
import Label from "@/components/admin/form/Label";
import TextArea from "@/components/admin/form/input/TextArea";
import type { HeroBannerDTO } from "@/lib/heroBanners";
import {
  DEFAULT_HERO_CTA_COLOR,
  HERO_CTA_PALETTE,
  HERO_IMAGE_SPECS,
  resolveHeroCtaColor,
  resolveHeroImageSrc,
  type HeroCtaColorId,
} from "@/lib/heroBanners";

type FormState = {
  title: string;
  title_ru: string;
  subtitle: string;
  subtitle_ru: string;
  price_label: string;
  price_label_ru: string;
  cta_label: string;
  cta_label_ru: string;
  cta_color: HeroCtaColorId;
  href: string;
  image_url: string;
  image_url_mobile: string;
  sort_order: string;
};

const emptyForm = (): FormState => ({
  title: "",
  title_ru: "",
  subtitle: "",
  subtitle_ru: "",
  price_label: "",
  price_label_ru: "",
  cta_label: "Купити",
  cta_label_ru: "",
  cta_color: DEFAULT_HERO_CTA_COLOR,
  href: "/catalog",
  image_url: "",
  image_url_mobile: "",
  sort_order: "0",
});

function toForm(b: HeroBannerDTO): FormState {
  return {
    title: b.title,
    title_ru: b.title_ru || "",
    subtitle: b.subtitle || "",
    subtitle_ru: b.subtitle_ru || "",
    price_label: b.price_label || "",
    price_label_ru: b.price_label_ru || "",
    cta_label: b.cta_label || "Купити",
    cta_label_ru: b.cta_label_ru || "",
    cta_color:
      (HERO_CTA_PALETTE.find((c) => c.id === b.cta_color)?.id as
        | HeroCtaColorId
        | undefined) ?? DEFAULT_HERO_CTA_COLOR,
    href: b.href || "/catalog",
    image_url: b.image_url,
    image_url_mobile: b.image_url_mobile || "",
    sort_order: String(b.sort_order ?? 0),
  };
}

function toPayload(form: FormState) {
  return {
    title: form.title,
    title_ru: form.title_ru || null,
    subtitle: form.subtitle || null,
    subtitle_ru: form.subtitle_ru || null,
    price_label: form.price_label || null,
    price_label_ru: form.price_label_ru || null,
    cta_label: form.cta_label || "Купити",
    cta_label_ru: form.cta_label_ru || null,
    cta_color: form.cta_color,
    href: form.href || "/catalog",
    image_url: form.image_url,
    image_url_mobile: form.image_url_mobile || null,
    sort_order: Number(form.sort_order) || 0,
    is_active: true,
    starts_at: null,
    ends_at: null,
  };
}

export default function HeroBannersSection() {
  const [list, setList] = useState<HeroBannerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero-banners");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadImage = async (file: File, target: "desktop" | "mobile") => {
    setUploading(target);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("images", file);
      const res = await fetch("/api/images", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Помилка завантаження зображення",
        });
        return;
      }
      const filename = data.media?.[0]?.url;
      if (!filename) {
        setMessage({ type: "error", text: "Сервер не повернув URL зображення" });
        return;
      }
      setField(target === "desktop" ? "image_url" : "image_url_mobile", filename);
    } catch {
      setMessage({ type: "error", text: "Помилка мережі під час завантаження" });
    } finally {
      setUploading(null);
    }
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Вкажіть заголовок" });
      return;
    }
    if (!form.image_url.trim()) {
      setMessage({ type: "error", text: "Додайте зображення" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = toPayload(form);
      const res = await fetch(
        editingId
          ? `/api/admin/hero-banners/${editingId}`
          : "/api/admin/hero-banners",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Помилка збереження" });
        return;
      }
      setMessage({
        type: "success",
        text: editingId ? "Банер оновлено" : "Банер створено",
      });
      resetForm();
      await fetchList();
    } catch {
      setMessage({ type: "error", text: "Помилка мережі" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: HeroBannerDTO) => {
    setEditingId(banner.id);
    setForm(toForm(banner));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Видалити цей hero-банер?")) return;
    try {
      const res = await fetch(`/api/admin/hero-banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Помилка видалення" });
        return;
      }
      if (editingId === id) resetForm();
      setMessage({ type: "success", text: "Банер видалено" });
      await fetchList();
    } catch {
      setMessage({ type: "error", text: "Помилка мережі" });
    }
  };

  return (
    <div className="space-y-6">
      <ComponentCard
        title={editingId ? `Редагувати банер #${editingId}` : "Новий hero-банер"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Заголовок (UA) *</Label>
              <Input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Програма місяця"
              />
            </div>
            <div>
              <Label>Заголовок (RU)</Label>
              <Input
                value={form.title_ru}
                onChange={(e) => setField("title_ru", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Підзаголовок (UA)</Label>
              <TextArea
                value={form.subtitle}
                onChange={(v) => setField("subtitle", v)}
                rows={3}
              />
            </div>
            <div>
              <Label>Підзаголовок (RU)</Label>
              <TextArea
                value={form.subtitle_ru}
                onChange={(v) => setField("subtitle_ru", v)}
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ціна на банері (UA)</Label>
              <Input
                value={form.price_label}
                onChange={(e) => setField("price_label", e.target.value)}
                placeholder="1 890 грн"
              />
            </div>
            <div>
              <Label>Ціна на банері (RU)</Label>
              <Input
                value={form.price_label_ru}
                onChange={(e) => setField("price_label_ru", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Текст кнопки (UA)</Label>
              <Input
                value={form.cta_label}
                onChange={(e) => setField("cta_label", e.target.value)}
                placeholder="Купити"
              />
            </div>
            <div>
              <Label>Текст кнопки (RU)</Label>
              <Input
                value={form.cta_label_ru}
                onChange={(e) => setField("cta_label_ru", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Колір кнопки</Label>
            <p className="mt-1 mb-3 text-xs text-gray-500">
              Оберіть колір з палітри бренду ForBody Space
            </p>
            <div className="flex flex-wrap gap-2">
              {HERO_CTA_PALETTE.map((color) => {
                const selected = form.cta_color === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setField("cta_color", color.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                      selected
                        ? "border-[#3D1A00] bg-[#FFFBF5] text-[#3D1A00] ring-2 ring-[#3D1A00]/20"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                    aria-pressed={selected}
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: color.bg }}
                      aria-hidden
                    />
                    {color.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Посилання кнопки *</Label>
              <Input
                value={form.href}
                onChange={(e) => setField("href", e.target.value)}
                placeholder="/product/slug або /catalog"
              />
              <p className="mt-1 text-xs text-gray-500">
                Напр. /product/mood-soft-ritual або /catalog?promo=1
              </p>
            </div>
            <div>
              <Label>Порядок (менше = вище)</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setField("sort_order", e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#E8DED0] bg-[#FFFBF5] p-4 md:p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#3D1A00]">
                Фото банера
              </h3>
              <p className="mt-1 text-xs text-gray-600">
                Окремі зображення для великих екранів і телефонів. На сайті
                desktop показується від 640 px, mobile — до 639 px.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <HeroBannerImageField
                spec={HERO_IMAGE_SPECS.desktop}
                required
                previewAspect="video"
                imageUrl={form.image_url}
                uploading={uploading === "desktop"}
                onUpload={(file) => void uploadImage(file, "desktop")}
              />
              <HeroBannerImageField
                spec={HERO_IMAGE_SPECS.mobile}
                previewAspect="portrait"
                imageUrl={form.image_url_mobile}
                fallbackUrl={form.image_url}
                uploading={uploading === "mobile"}
                onUpload={(file) => void uploadImage(file, "mobile")}
                onClear={() => setField("image_url_mobile", "")}
              />
            </div>
          </div>

          <HeroBannerLivePreview form={form} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !!uploading}
              className="rounded-lg bg-[#3D1A00] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting
                ? "Збереження…"
                : editingId
                  ? "Оновити банер"
                  : "Створити банер"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm"
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Усі hero-банери">
        {loading ? (
          <p className="text-sm text-gray-500">Завантаження…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">
            Поки немає банерів. Створіть перший — на головній лишиться
            статичний fallback.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
                    <Image
                      src={resolveHeroImageSrc(b.image_url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      #{b.id} · {b.title}
                      {!b.is_active && (
                        <span className="ml-2 text-xs text-amber-700">
                          (вимкнено)
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {b.href} · порядок {b.sort_order}
                      {b.price_label ? ` · ${b.price_label}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(b)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-xs"
                  >
                    Редагувати
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(b.id)}
                    className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600"
                  >
                    Видалити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>
    </div>
  );
}

type ImageSpec = (typeof HERO_IMAGE_SPECS)[keyof typeof HERO_IMAGE_SPECS];

function HeroBannerLivePreview({ form }: { form: FormState }) {
  const cta = resolveHeroCtaColor(form.cta_color);
  const desktopSrc = form.image_url
    ? resolveHeroImageSrc(form.image_url)
    : null;
  const mobileSrc = form.image_url_mobile
    ? resolveHeroImageSrc(form.image_url_mobile)
    : desktopSrc;
  const title = form.title.trim() || "Заголовок банера";
  const subtitle = form.subtitle.trim();
  const price = form.price_label.trim();
  const ctaLabel = form.cta_label.trim() || "Купити";

  return (
    <div className="rounded-xl border border-[#E8DED0] bg-[#FFFBF5] p-4 md:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[#3D1A00]">
          Як виглядатиме на головній
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Живий попередній перегляд зі поточними текстами, кольором кнопки та
          фото (UA). Оновлюється одразу при зміні полів.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
        <div>
          <p className="mb-2 text-xs font-medium text-gray-600">Комп&apos;ютер</p>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-gray-200 shadow-sm">
            {desktopSrc ? (
              <Image
                src={desktopSrc}
                alt=""
                fill
                className="object-cover object-right"
                sizes="(max-width: 1280px) 100vw, 720px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-300 to-neutral-400 text-xs text-white/80">
                Додайте desktop-фото
              </div>
            )}
            <div
              className="absolute inset-0 bg-black/25 pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center px-6 py-5 md:px-8">
              <div className="flex max-w-md flex-col items-start gap-3">
                <h4
                  className="text-left text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: "clamp(1.35rem, 2.8vw, 2.25rem)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </h4>
                {subtitle ? (
                  <p className="max-w-sm text-left font-['Montserrat'] text-sm leading-snug text-white/95 drop-shadow md:text-base">
                    {subtitle}
                  </p>
                ) : null}
                {price ? (
                  <span className="font-['Montserrat'] text-lg font-semibold text-white drop-shadow">
                    {price}
                  </span>
                ) : null}
                <span
                  className="inline-flex h-10 items-center justify-center rounded-full px-6 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: cta.bg,
                    color: cta.text,
                    boxShadow: `0 4px 18px ${cta.shadow}`,
                  }}
                >
                  {ctaLabel}
                </span>
                <p className="font-['Montserrat'] text-[10px] text-white/70">
                  → {form.href || "/catalog"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[200px] xl:mx-0">
          <p className="mb-2 text-xs font-medium text-gray-600">Мобільний</p>
          <div className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] border-4 border-[#3D1A00]/15 bg-gray-200 shadow-md">
            {mobileSrc ? (
              <Image
                src={mobileSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="200px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-300 to-neutral-400 px-3 text-center text-[10px] text-white/80">
                Додайте фото
              </div>
            )}
            <div
              className="absolute inset-0 bg-black/25 pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/25 to-transparent pointer-events-none"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-end px-3 pb-5 pt-8">
              <div className="flex w-full flex-col items-start gap-2">
                <h4
                  className="text-left text-white drop-shadow"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </h4>
                {subtitle ? (
                  <p className="line-clamp-3 text-left font-['Montserrat'] text-[10px] leading-snug text-white/95">
                    {subtitle}
                  </p>
                ) : null}
                {price ? (
                  <span className="font-['Montserrat'] text-sm font-semibold text-white">
                    {price}
                  </span>
                ) : null}
                <span
                  className="inline-flex h-9 w-full items-center justify-center rounded-full px-3 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: cta.bg,
                    color: cta.text,
                    boxShadow: `0 4px 14px ${cta.shadow}`,
                  }}
                >
                  {ctaLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBannerImageField({
  spec,
  required,
  previewAspect,
  imageUrl,
  fallbackUrl,
  uploading,
  onUpload,
  onClear,
}: {
  spec: ImageSpec;
  required?: boolean;
  previewAspect: "video" | "portrait";
  imageUrl: string;
  fallbackUrl?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear?: () => void;
}) {
  const previewSrc = imageUrl
    ? resolveHeroImageSrc(imageUrl)
    : fallbackUrl
      ? resolveHeroImageSrc(fallbackUrl)
      : null;
  const usingFallback = !imageUrl && !!fallbackUrl;

  return (
    <div className="rounded-lg border border-[#E8DED0]/80 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <Label className="mb-0">
          {spec.label}
          {required ? " *" : " (опційно)"}
        </Label>
        {onClear && imageUrl && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:underline"
          >
            Прибрати
          </button>
        )}
      </div>

      <dl className="mt-2 space-y-1 text-xs text-gray-600">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <dt className="font-medium text-gray-700">Рекомендований розмір:</dt>
          <dd>{spec.recommendedSize}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <dt className="font-medium text-gray-700">Пропорції:</dt>
          <dd>{spec.aspectRatio}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <dt className="font-medium text-gray-700">Формати:</dt>
          <dd>
            {spec.formats} · {spec.maxWeight}
          </dd>
        </div>
      </dl>

      <p className="mt-2 text-xs leading-relaxed text-gray-500">{spec.hint}</p>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="mt-3 block w-full text-sm"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      {uploading && (
        <p className="mt-1 text-xs text-gray-500">Завантаження…</p>
      )}

      {previewSrc ? (
        <div
          className={`relative mt-3 w-full overflow-hidden rounded-lg bg-gray-100 ${
            previewAspect === "portrait"
              ? "mx-auto max-w-[140px] aspect-[9/16]"
              : "aspect-video"
          }`}
        >
          <Image
            src={previewSrc}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
          />
          {usingFallback && (
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              як на desktop
            </span>
          )}
        </div>
      ) : (
        <div
          className={`mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 ${
            previewAspect === "portrait"
              ? "mx-auto max-w-[140px] aspect-[9/16]"
              : "aspect-video"
          }`}
        >
          Попередній перегляд
        </div>
      )}
    </div>
  );
}
