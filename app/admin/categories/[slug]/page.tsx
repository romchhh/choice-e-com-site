"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Image from "next/image";
import CategoryDescriptionMarkdown from "@/components/shared/CategoryDescriptionMarkdown";

type Subcategory = {
  id?: number;
  name: string;
  name_ru?: string | null;
  slug?: string | null;
  ruTouched?: boolean;
};

type MediaFile = {
  file: File;
  type: "photo" | "video";
  preview?: string;
};

async function translateUkToRuClient(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const res = await fetch("/api/admin/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
  });
  if (!res.ok) throw new Error("translate failed");
  const data = await res.json();
  return typeof data.text === "string" ? data.text : trimmed;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = typeof params?.slug === "string" ? params.slug : "";

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletedSubcategorySlugs, setDeletedSubcategorySlugs] = useState<string[]>(
    []
  );

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [existingMediaType, setExistingMediaType] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    name_ru: "",
    priority: 0,
    description: "",
    description_ru: "",
    subcategories: [] as Subcategory[],
  });
  const [nameRuTouched, setNameRuTouched] = useState(false);
  const [descriptionRuTouched, setDescriptionRuTouched] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const nameRuTouchedRef = useRef(false);
  const descriptionRuTouchedRef = useRef(false);

  const categoryDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const nameTranslateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descTranslateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wrapMarkdownSelection = (wrap: string) => {
    const el = categoryDescriptionRef.current;
    const v = formData.description;
    if (!el) {
      const inner = "текст";
      setFormData((p) => ({ ...p, description: p.description + wrap + inner + wrap }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = v.slice(start, end);
    const inner = sel || "текст";
    const next = v.slice(0, start) + wrap + inner + wrap + v.slice(end);
    setFormData((p) => ({ ...p, description: next }));
    requestAnimationFrame(() => {
      el.focus();
      if (!sel) {
        el.setSelectionRange(start + wrap.length, start + wrap.length + inner.length);
      } else {
        const c = start + wrap.length + inner.length + wrap.length;
        el.setSelectionRange(c, c);
      }
    });
  };

  const insertMarkdownLinePrefix = (prefix: string) => {
    const el = categoryDescriptionRef.current;
    const v = formData.description;
    if (!el) {
      setFormData((p) => ({ ...p, description: (p.description ? p.description + "\n" : "") + prefix }));
      return;
    }
    const start = el.selectionStart;
    const lineStart = v.lastIndexOf("\n", start - 1) + 1;
    const next = v.slice(0, lineStart) + prefix + v.slice(lineStart);
    setFormData((p) => ({ ...p, description: next }));
    requestAnimationFrame(() => {
      el.focus();
      const pos = lineStart + prefix.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const insertMarkdownLink = () => {
    const label = window.prompt("Текст посилання", "дізнатися більше");
    if (label === null) return;
    const url = window.prompt("URL (https://…)", "https://");
    if (url === null || !url.trim()) return;
    const el = categoryDescriptionRef.current;
    const md = `[${label || "посилання"}](${url.trim()})`;
    if (!el) {
      setFormData((p) => ({ ...p, description: p.description + md }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const v = formData.description;
    const next = v.slice(0, start) + md + v.slice(end);
    setFormData((p) => ({ ...p, description: next }));
    requestAnimationFrame(() => {
      el.focus();
      const c = start + md.length;
      el.setSelectionRange(c, c);
    });
  };

  useEffect(() => {
    async function fetchData() {
      if (!categorySlug) return;
      setLoadingData(true);
      setError(null);
      try {
        const categoryRes = await fetch(
          `/api/categories/${encodeURIComponent(categorySlug)}`
        );
        if (!categoryRes.ok) {
          const errorData = await categoryRes.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to fetch category: ${categoryRes.status}`
          );
        }

        const category = await categoryRes.json();
        setCategoryId(category.id);

        let subcategories: Subcategory[] = [];
        try {
          const subcategoriesRes = await fetch(
            `/api/subcategories?parent_category_id=${category.id}`
          );
          if (subcategoriesRes.ok) {
            subcategories = await subcategoriesRes.json();
          }
        } catch (subErr) {
          console.warn("Failed to fetch subcategories:", subErr);
        }

        setFormData({
          name: category.name || "",
          name_ru: category.name_ru || "",
          priority: category.priority ?? 0,
          description: category.description || "",
          description_ru: category.description_ru || "",
          subcategories: (subcategories || []).map(
            (s: Subcategory & { name_ru?: string | null }) => ({
              ...s,
              name_ru: s.name_ru || "",
              ruTouched: !!(s.name_ru && String(s.name_ru).trim()),
            })
          ),
        });
        setNameRuTouched(!!(category.name_ru && String(category.name_ru).trim()));
        nameRuTouchedRef.current = !!(
          category.name_ru && String(category.name_ru).trim()
        );
        setDescriptionRuTouched(
          !!(category.description_ru && String(category.description_ru).trim())
        );
        descriptionRuTouchedRef.current = !!(
          category.description_ru && String(category.description_ru).trim()
        );

        if (category.mediaUrl) {
          setExistingMediaUrl(category.mediaUrl);
          setExistingMediaType(category.mediaType);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(
          err instanceof Error ? err.message : "Помилка при завантаженні категорії"
        );
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [categorySlug]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "priority" ? Number(value) : value,
    }));
  };

  const autoTranslateName = (ua: string) => {
    if (nameTranslateTimer.current) clearTimeout(nameTranslateTimer.current);
    if (nameRuTouchedRef.current) return;
    const text = ua.trim();
    if (!text) {
      setFormData((p) => ({ ...p, name_ru: "" }));
      return;
    }
    nameTranslateTimer.current = setTimeout(() => {
      setTranslating("name");
      void translateUkToRuClient(text)
        .then((ru) => {
          if (!nameRuTouchedRef.current) {
            setFormData((p) => ({ ...p, name_ru: ru }));
          }
        })
        .catch(() => {})
        .finally(() => setTranslating((t) => (t === "name" ? null : t)));
    }, 500);
  };

  const autoTranslateDescription = (ua: string) => {
    if (descTranslateTimer.current) clearTimeout(descTranslateTimer.current);
    if (descriptionRuTouchedRef.current) return;
    const text = ua.trim();
    if (!text) {
      setFormData((p) => ({ ...p, description_ru: "" }));
      return;
    }
    descTranslateTimer.current = setTimeout(() => {
      setTranslating("description");
      void translateUkToRuClient(text)
        .then((ru) => {
          if (!descriptionRuTouchedRef.current) {
            setFormData((p) => ({ ...p, description_ru: ru }));
          }
        })
        .catch(() => {})
        .finally(() =>
          setTranslating((t) => (t === "description" ? null : t))
        );
    }, 700);
  };

  const regenerateNameRu = async () => {
    const text = formData.name.trim();
    if (!text) return;
    setTranslating("name");
    try {
      const ru = await translateUkToRuClient(text);
      setFormData((p) => ({ ...p, name_ru: ru }));
      setNameRuTouched(false);
      nameRuTouchedRef.current = false;
    } catch {
      setError("Не вдалося згенерувати російську назву");
    } finally {
      setTranslating((t) => (t === "name" ? null : t));
    }
  };

  const regenerateDescriptionRu = async () => {
    const text = formData.description.trim();
    if (!text) return;
    setTranslating("description");
    try {
      const ru = await translateUkToRuClient(text);
      setFormData((p) => ({ ...p, description_ru: ru }));
      setDescriptionRuTouched(false);
      descriptionRuTouchedRef.current = false;
    } catch {
      setError("Не вдалося згенерувати російський опис");
    } finally {
      setTranslating((t) => (t === "description" ? null : t));
    }
  };

  const handleSubcategoryNameChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      const current = newSubs[index];
      newSubs[index] = { ...current, name: value };
      return { ...prev, subcategories: newSubs };
    });

    const sub = formData.subcategories[index];
    if (sub?.ruTouched) return;
    const text = value.trim();
    window.setTimeout(() => {
      if (!text) {
        setFormData((prev) => {
          const newSubs = [...prev.subcategories];
          if (!newSubs[index] || newSubs[index].ruTouched) return prev;
          newSubs[index] = { ...newSubs[index], name_ru: "" };
          return { ...prev, subcategories: newSubs };
        });
        return;
      }
      void translateUkToRuClient(text)
        .then((ru) => {
          setFormData((prev) => {
            const newSubs = [...prev.subcategories];
            if (!newSubs[index] || newSubs[index].ruTouched) return prev;
            newSubs[index] = { ...newSubs[index], name_ru: ru };
            return { ...prev, subcategories: newSubs };
          });
        })
        .catch(() => {});
    }, 500);
  };

  const handleSubcategoryRuChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      newSubs[index] = {
        ...newSubs[index],
        name_ru: value,
        ruTouched: true,
      };
      return { ...prev, subcategories: newSubs };
    });
  };

  const regenerateSubcategoryRu = async (index: number) => {
    const name = formData.subcategories[index]?.name?.trim();
    if (!name) return;
    setTranslating(`sub-${index}`);
    try {
      const ru = await translateUkToRuClient(name);
      setFormData((prev) => {
        const newSubs = [...prev.subcategories];
        newSubs[index] = { ...newSubs[index], name_ru: ru, ruTouched: false };
        return { ...prev, subcategories: newSubs };
      });
    } catch {
      setError("Не вдалося згенерувати переклад підкатегорії");
    } finally {
      setTranslating((t) => (t === `sub-${index}` ? null : t));
    }
  };

  const handleDrop = (files: File[]) => {
    const newMedia = files.map((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        file.name.toLowerCase().endsWith(".webm") ||
        file.name.toLowerCase().endsWith(".mp4") ||
        file.name.toLowerCase().endsWith(".mov") ||
        file.name.toLowerCase().endsWith(".avi") ||
        file.name.toLowerCase().endsWith(".mkv") ||
        file.name.toLowerCase().endsWith(".flv") ||
        file.name.toLowerCase().endsWith(".wmv");

      return {
        file,
        type: (isVideo ? "video" : "photo") as MediaFile["type"],
        preview: URL.createObjectURL(file),
      };
    });

    setMediaFiles((prev) => [...prev, ...newMedia]);
    setExistingMediaUrl(null);
    setExistingMediaType(null);
  };

  const handleRemoveMedia = (index: number) => {
    const mediaToRemove = mediaFiles[index];
    if (mediaToRemove?.preview) {
      URL.revokeObjectURL(mediaToRemove.preview);
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        { name: "", name_ru: "", ruTouched: false },
      ],
    }));
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData((prev) => {
      const subToRemove = prev.subcategories[index];
      const updated = [...prev.subcategories];
      updated.splice(index, 1);

      if (subToRemove.slug) {
        setDeletedSubcategorySlugs((prev) => [...prev, subToRemove.slug!]);
      }

      return { ...prev, subcategories: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categorySlug || categoryId === null) return;
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const { name, subcategories } = formData;

      if (!name.trim()) {
        setError("Назва категорії не може бути порожньою");
        setLoading(false);
        return;
      }

      let finalMediaUrl = existingMediaUrl;
      let finalMediaType = existingMediaType;

      if (mediaFiles.length > 0) {
        const uploadForm = new FormData();
        mediaFiles.forEach((m) => uploadForm.append("images", m.file));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadData = await uploadRes.json();
        if (uploadData.media && uploadData.media.length > 0) {
          finalMediaUrl = uploadData.media[0].url;
          finalMediaType = uploadData.media[0].type;
        }
      }

      const categoryRes = await fetch(
        `/api/categories/${encodeURIComponent(categorySlug)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            name_ru: formData.name_ru,
            priority: formData.priority,
            mediaType: finalMediaType,
            mediaUrl: finalMediaUrl,
            description: formData.description,
            description_ru: formData.description_ru,
          }),
        }
      );

      if (!categoryRes.ok) throw new Error("Failed to update category");

      for (const slug of deletedSubcategorySlugs) {
        await fetch(`/api/subcategories/${encodeURIComponent(slug)}`, {
          method: "DELETE",
        });
      }

      for (const sub of subcategories) {
        const trimmedName = sub.name.trim();
        if (!trimmedName) continue;

        if (sub.slug) {
          await fetch(`/api/subcategories/${encodeURIComponent(sub.slug)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              name_ru: sub.name_ru?.trim() || null,
              parent_category_id: categoryId,
            }),
          });
        } else {
          await fetch(`/api/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              name_ru: sub.name_ru?.trim() || null,
              parent_category_id: categoryId,
            }),
          });
        }
      }

      setSuccess("Категорію успішно оновлено");
      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити категорію");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Категорію" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4">
              <ComponentCard title="Редагування Категорії">
                <Label>Назва категорії (UA)</Label>
                <Input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                    autoTranslateName(e.target.value);
                  }}
                  placeholder="Введіть назву категорії"
                />

                <div className="mt-3 flex items-center justify-between gap-2">
                  <Label className="mb-0">Назва (RU)</Label>
                  <button
                    type="button"
                    onClick={() => void regenerateNameRu()}
                    disabled={!formData.name.trim() || translating === "name"}
                    className="text-xs font-medium text-[#8B9A47] hover:underline disabled:opacity-50"
                  >
                    {translating === "name"
                      ? "Переклад…"
                      : "Згенерувати знову"}
                  </button>
                </div>
                <Input
                  type="text"
                  value={formData.name_ru || ""}
                  onChange={(e) => {
                    setNameRuTouched(true);
                    nameRuTouchedRef.current = true;
                    handleChange("name_ru", e.target.value);
                  }}
                  placeholder="Російська назва (генерується автоматично)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Заповнюється автоматично з UA. Можна відредагувати вручну.
                </p>

                <Label className="mt-4">Пріоритет</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                />

                <Label className="mt-4">
                  Опис категорії (UA) — Markdown
                </Label>
                <p className="mt-1 text-xs text-gray-500">
                  Підтримується <strong>Markdown</strong> (жирний <code className="rounded bg-gray-100 px-1">**текст**</code>, курсив{" "}
                  <code className="rounded bg-gray-100 px-1">*текст*</code>, списки,{" "}
                  <code className="rounded bg-gray-100 px-1">## Заголовок</code>, посилання{" "}
                  <code className="rounded bg-gray-100 px-1">[текст](url)</code>) і безпечний{" "}
                  <strong>HTML</strong> з редактора (<code className="rounded bg-gray-100 px-1">&lt;p&gt;</code>,{" "}
                  <code className="rounded bg-gray-100 px-1">&lt;br&gt;</code>,{" "}
                  <code className="rounded bg-gray-100 px-1">&lt;strong&gt;</code> тощо). Новий рядок у тексті
                  дає перенесення рядка на сайті.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => wrapMarkdownSelection("**")}
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Жирний
                  </button>
                  <button
                    type="button"
                    onClick={() => wrapMarkdownSelection("*")}
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Курсив
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownLinePrefix("- ")}
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Список
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdownLinePrefix("## ")}
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Заголовок
                  </button>
                  <button
                    type="button"
                    onClick={insertMarkdownLink}
                    className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Посилання
                  </button>
                </div>
                <textarea
                  ref={categoryDescriptionRef}
                  value={formData.description}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) => ({ ...prev, description: v }));
                    autoTranslateDescription(v);
                  }}
                  placeholder="Опис категорії у форматі Markdown…"
                  className="mt-2 w-full min-h-[140px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {formData.description.trim() ? (
                  <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Перегляд (UA)
                    </p>
                    <div className="rounded-md bg-white p-3 text-gray-900">
                      <CategoryDescriptionMarkdown content={formData.description} />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <Label className="mb-0">Опис (RU)</Label>
                  <button
                    type="button"
                    onClick={() => void regenerateDescriptionRu()}
                    disabled={
                      !formData.description.trim() ||
                      translating === "description"
                    }
                    className="text-xs font-medium text-[#8B9A47] hover:underline disabled:opacity-50"
                  >
                    {translating === "description"
                      ? "Переклад…"
                      : "Згенерувати знову"}
                  </button>
                </div>
                <textarea
                  value={formData.description_ru}
                  onChange={(e) => {
                    setDescriptionRuTouched(true);
                    descriptionRuTouchedRef.current = true;
                    setFormData((prev) => ({
                      ...prev,
                      description_ru: e.target.value,
                    }));
                  }}
                  placeholder="Російський опис (генерується автоматично)"
                  className="mt-2 w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {formData.description_ru.trim() ? (
                  <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Перегляд (RU)
                    </p>
                    <div className="rounded-md bg-white p-3 text-gray-900">
                      <CategoryDescriptionMarkdown
                        content={formData.description_ru}
                      />
                    </div>
                  </div>
                ) : null}

                <Label className="mt-6">Підкатегорії</Label>
                {formData.subcategories.map((sub, index) => (
                  <div
                    key={sub.id ?? `new-${index}`}
                    className="mb-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={sub.name}
                        onChange={(e) =>
                          handleSubcategoryNameChange(index, e.target.value)
                        }
                        placeholder="Назва (UA)"
                      />
                      <button
                        type="button"
                        className="text-red-600 font-bold px-2"
                        onClick={() => handleRemoveSubcategory(index)}
                        title="Видалити"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="text"
                        value={sub.name_ru || ""}
                        onChange={(e) =>
                          handleSubcategoryRuChange(index, e.target.value)
                        }
                        placeholder="Назва (RU)"
                      />
                      <button
                        type="button"
                        onClick={() => void regenerateSubcategoryRu(index)}
                        disabled={
                          !sub.name.trim() || translating === `sub-${index}`
                        }
                        className="shrink-0 whitespace-nowrap text-xs font-medium text-[#8B9A47] hover:underline disabled:opacity-50"
                      >
                        {translating === `sub-${index}` ? "…" : "↻ RU"}
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded shadow-sm hover:bg-green-600 transition"
                >
                  Додати підкатегорію
                </button>
              </ComponentCard>
            </div>

            <div className="p-4">
              <DropzoneComponent onDrop={handleDrop} />

              {existingMediaUrl && (
                <div className="mt-4 relative inline-block">
                  {existingMediaType === "video" ? (
                    <video
                      src={`/api/images/${existingMediaUrl}`}
                      className="w-32 h-32 object-cover rounded"
                      controls
                    />
                  ) : (
                    <div className="relative w-32 h-32">
                      <Image
                        src={`/api/images/${existingMediaUrl}`}
                        alt="Category media"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setExistingMediaUrl(null);
                      setExistingMediaType(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Видалити"
                  >
                    ✕
                  </button>
                </div>
              )}

              {mediaFiles.map((media, i) => {
                const previewUrl =
                  media.preview || URL.createObjectURL(media.file);
                const isVideo = media.type === "video";
                return (
                  <div
                    key={`new-${i}`}
                    className="relative inline-block mt-4 mx-2"
                  >
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        controls
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={`new-media-${i}`}
                        width={128}
                        height={128}
                        className="rounded object-cover"
                        unoptimized
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-end px-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition font-medium"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти"}
            </button>
          </div>

          {success && (
            <div className="text-green-600 text-center mt-4">{success}</div>
          )}
          {error && (
            <div className="text-red-600 text-center mt-4">{error}</div>
          )}
        </form>
      )}
    </div>
  );
}
