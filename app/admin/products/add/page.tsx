"use client";

import React, { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import Image from "next/image";
import { parseProductPageText } from "@/lib/parseProductFile";

interface Category {
  id: number;
  name: string;
}

export default function FormElements() {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [releaseForm, setReleaseForm] = useState("");
  const [course, setCourse] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [mainInfo, setMainInfo] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [mainAction, setMainAction] = useState("");
  const [indicationsForUse, setIndicationsForUse] = useState("");
  const [benefits, setBenefits] = useState("");
  const [fullComposition, setFullComposition] = useState("");
  const [usageMethod, setUsageMethod] = useState("");
  const [contraindications, setContraindications] = useState("");
  const [storageConditions, setStorageConditions] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<
    Record<number, Category[]>
  >({});
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    number[]
  >([]);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [priority, setPriority] = useState("0");
  const [stock, setStock] = useState("0");
  const [fabricComposition, setFabricComposition] = useState("");
  const [hasLining, setHasLining] = useState(false);
  const [liningDescription, setLiningDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseFileLoading, setParseFileLoading] = useState(false);
  const [parseFileError, setParseFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  const loadSubcategoriesForCategory = async (categoryId: number) => {
    // Avoid refetching if already loaded
    if (subcategoriesByCategory[categoryId]) return;

    try {
      const res = await fetch(
        `/api/subcategories?parent_category_id=${categoryId}`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      const data: Category[] = await res.json();
      setSubcategoriesByCategory((prev) => ({
        ...prev,
        [categoryId]: data,
      }));
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  type MediaFile = {
    file: File;
    type: "photo" | "video";
  };

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const handleAddFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setParseFileError(null);
    setParseFileLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/parse-product-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка читання файлу");
      const parsed = parseProductPageText(data.text);
      if (parsed.name) setName(parsed.name);
      if (parsed.subtitle != null) setSubtitle(parsed.subtitle);
      if (parsed.releaseForm != null) setReleaseForm(parsed.releaseForm);
      if (parsed.course != null) setCourse(parsed.course);
      if (parsed.packageWeight != null) setPackageWeight(parsed.packageWeight);
      if (parsed.mainInfo != null) setMainInfo(parsed.mainInfo);
      if (parsed.shortDescription != null) setShortDescription(parsed.shortDescription);
      if (parsed.description != null) setDescription(parsed.description);
      if (parsed.mainAction != null) setMainAction(parsed.mainAction);
      if (parsed.indicationsForUse != null) setIndicationsForUse(parsed.indicationsForUse);
      if (parsed.benefits != null) setBenefits(parsed.benefits);
      if (parsed.fullComposition != null) setFullComposition(parsed.fullComposition);
      if (parsed.usageMethod != null) setUsageMethod(parsed.usageMethod);
      if (parsed.contraindications != null) setContraindications(parsed.contraindications);
      if (parsed.storageConditions != null) setStorageConditions(parsed.storageConditions);
      if (parsed.price != null) setPrice(parsed.price);
    } catch (err) {
      setParseFileError(err instanceof Error ? err.message : "Помилка обробки файлу");
    } finally {
      setParseFileLoading(false);
    }
  };

  const handleDrop = (files: File[]) => {
    const newMedia = files.map((file) => {
      // Determine if file is video by mime type OR extension
      const isVideo = file.type.startsWith("video/") || 
        file.name.toLowerCase().endsWith('.webm') ||
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.mov') ||
        file.name.toLowerCase().endsWith('.avi') ||
        file.name.toLowerCase().endsWith('.mkv') ||
        file.name.toLowerCase().endsWith('.flv') ||
        file.name.toLowerCase().endsWith('.wmv');
      
      console.log('[handleDrop] File:', file.name, 'Type:', file.type, 'Is video:', isVideo);
      
      return {
        file,
        type: (isVideo ? "video" : "photo") as MediaFile["type"],
      };
    });
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };
// const handleDeleteMediaFile = (indexToRemove: number) => {
//   setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
// };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // 1) Upload images first (if any)
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];
      if (mediaFiles.length > 0) {
        const uploadForm = new FormData();
        mediaFiles.forEach((m) => uploadForm.append("images", m.file));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media || [];
      }

      // 2) Prepare category / subcategory data
      const allCategoryIds = Array.from(new Set(selectedCategoryIds));
      const allSubcategoryIds = Array.from(new Set(selectedSubcategoryIds));
      const primaryCategoryId = allCategoryIds[0] ?? null;
      const primarySubcategoryId = allSubcategoryIds[0] ?? null;

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subtitle: subtitle || null,
          release_form: releaseForm || null,
          course: course || null,
          package_weight: packageWeight || null,
          main_info: mainInfo || null,
          short_description: shortDescription || null,
          description: description || null,
          main_action: mainAction || null,
          indications_for_use: indicationsForUse || null,
          benefits: benefits || null,
          full_composition: fullComposition || null,
          usage_method: usageMethod || null,
          contraindications: contraindications || null,
          storage_conditions: storageConditions || null,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          discount_percentage: discountPercentage ? Number(discountPercentage) : null,
          priority: Number(priority || 0),
          stock: Number(stock) || 0,
          top_sale: bestseller,
          in_stock: inStock,
          limited_edition: false,
          category_id: primaryCategoryId,
          subcategory_id: primarySubcategoryId,
          media: uploadedMedia,
          fabric_composition: fabricComposition || null,
          has_lining: hasLining,
          lining_description: liningDescription || null,
          category_ids: allCategoryIds,
          subcategory_ids: allSubcategoryIds,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Failed to create product");
      }

      setSuccess("Товар успішно створено!");
      setName("");
      setSubtitle("");
      setMainInfo("");
      setShortDescription("");
      setDescription("");
      setMainAction("");
      setIndicationsForUse("");
      setBenefits("");
      setFullComposition("");
      setUsageMethod("");
      setContraindications("");
      setStorageConditions("");
      setPrice("");
      setOldPrice("");
      setDiscountPercentage("");
      setPriority("0");
      setStock("0");
      setMediaFiles([]);
      setBestseller(false);
      setInStock(true);
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
      setFabricComposition("");
      setHasLining(false);
      setLiningDescription("");
      setReleaseForm("");
      setCourse("");
      setPackageWeight("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка при створенні товару"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <PageBreadcrumb pageTitle="Додати Товар" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleAddFromFile}
      />
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parseFileLoading}
            className="min-h-[44px] sm:min-h-0 text-sm text-blue-600 hover:text-blue-800 border border-blue-400 hover:border-blue-600 rounded-lg px-4 py-2.5 sm:py-1.5 disabled:opacity-50 touch-manipulation"
          >
            {parseFileLoading ? "Завантаження…" : "Додати з файлу"}
          </button>
          <span className="text-xs text-gray-500">.doc, .docx, .pdf, .txt</span>
        </div>
        {parseFileError && (
          <div className="text-sm text-red-600 mb-2">{parseFileError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Left side: inputs */}
          <div className="min-w-0 p-0 sm:p-2 md:p-4">
            <ComponentCard title="Основна інформація">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label>Назва</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Форма випуску</Label>
                    <Input
                      type="text"
                      value={releaseForm}
                      onChange={(e) => setReleaseForm(e.target.value)}
                      placeholder="Напр. 30 саше по 2 г"
                    />
                  </div>
                  <div>
                    <Label>Курс</Label>
                    <Input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="Напр. 30 днів"
                    />
                  </div>
                </div>

                <div>
                  <Label>Основна інформація</Label>
                  <TextArea
                    value={mainInfo}
                    onChange={setMainInfo}
                    rows={3}
                    placeholder="Короткий блок основної інформації"
                  />
                </div>

                <div>
                  <Label>ОПИС</Label>
                  <TextArea
                    value={description}
                    onChange={setDescription}
                    rows={6}
                  />
                </div>

                <div>
                  <Label>Ціна, стара ціна, знижка</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ціна (грн)"
                    />
                    <Input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder="Стара ціна"
                    />
                    <Input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      placeholder="% знижки"
                    />
                  </div>
                </div>

                <div>
                  <Label>Категорії показу товару</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Спочатку оберіть одну або кілька категорій. Для вибраних
                    категорій можна також відмітити підкатегорії.
                  </p>

                  {/* Список категорій з галочками */}
                  {categories.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500">
                          Категорії
                        </p>
                        <button
                          type="button"
                          className="text-[11px] text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            if (selectedCategoryIds.length) {
                              setSelectedCategoryIds([]);
                              setSelectedSubcategoryIds([]);
                            } else {
                              const allIds = categories.map((c) => c.id);
                              setSelectedCategoryIds(allIds);
                              // Підкатегорії для всіх підвантажимо поступово при відкритті
                            }
                          }}
                        >
                          {selectedCategoryIds.length ? "Скинути всі" : "Обрати всі"}
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg px-3 py-2 space-y-1">
                        {categories.map((cat) => {
                          const checked = selectedCategoryIds.includes(cat.id);
                          return (
                            <label
                              key={cat.id}
                              className="flex items-center gap-2 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded border-gray-300 text-[#8B9A47] focus:ring-[#8B9A47]"
                                checked={checked}
                                onChange={async () => {
                                  if (checked) {
                                    // Забираємо категорію та її підкатегорії
                                    setSelectedCategoryIds((prev) =>
                                      prev.filter((id) => id !== cat.id)
                                    );
                                    setSelectedSubcategoryIds((prev) =>
                                      prev.filter(
                                        (sid) =>
                                          !subcategoriesByCategory[cat.id]?.some(
                                            (s) => s.id === sid
                                          )
                                      )
                                    );
                                  } else {
                                    setSelectedCategoryIds((prev) => [
                                      ...prev,
                                      cat.id,
                                    ]);
                                    await loadSubcategoriesForCategory(cat.id);
                                  }
                                }}
                              />
                              <span className="text-gray-700">{cat.name}</span>
                            </label>
                          );
                        })}
                      </div>

                      {selectedCategoryIds.length > 0 && (
                        <p className="text-[11px] text-gray-500">
                          Основною вважається перша вибрана категорія. Зараз:{" "}
                          <span className="font-medium">
                            {(() => {
                              const mainCatId = selectedCategoryIds[0];
                              const mainCat = categories.find(
                                (c) => c.id === mainCatId
                              );
                              return mainCat ? mainCat.name : "не вибрано";
                            })()}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Категорії ще не створені.
                    </p>
                  )}

                  {/* Підкатегорії для вибраних категорій */}
                  {selectedCategoryIds.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {selectedCategoryIds.map((catId) => {
                        const cat = categories.find((c) => c.id === catId);
                        const subs = subcategoriesByCategory[catId] || [];

                        return (
                          <div key={catId}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-500">
                                Підкатегорії для{" "}
                                <span className="font-medium">
                                  {cat?.name ?? "категорії"}
                                </span>
                              </p>
                              {subs.length > 0 && (
                                <button
                                  type="button"
                                  className="text-[11px] text-blue-600 hover:text-blue-800"
                                  onClick={() => {
                                    const allIds = subs.map((s) => s.id);
                                    const allSelectedForCat = allIds.every((id) =>
                                      selectedSubcategoryIds.includes(id)
                                    );

                                    if (allSelectedForCat) {
                                      // Скинути всі підкатегорії цієї категорії
                                      setSelectedSubcategoryIds((prev) =>
                                        prev.filter(
                                          (id) => !allIds.includes(id)
                                        )
                                      );
                                    } else {
                                      // Додати всі підкатегорії цієї категорії
                                      setSelectedSubcategoryIds((prev) =>
                                        Array.from(new Set([...prev, ...allIds]))
                                      );
                                    }
                                  }}
                                >
                                  {(() => {
                                    const allIds = subs.map((s) => s.id);
                                    const allSelectedForCat = allIds.length > 0 &&
                                      allIds.every((id) =>
                                        selectedSubcategoryIds.includes(id)
                                      );
                                    return allSelectedForCat
                                      ? "Скинути всі"
                                      : "Обрати всі";
                                  })()}
                                </button>
                              )}
                            </div>

                            {subs.length > 0 ? (
                              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg px-3 py-2 space-y-1">
                                {subs.map((s) => {
                                  const checked =
                                    selectedSubcategoryIds.includes(s.id);
                                  return (
                                    <label
                                      key={s.id}
                                      className="flex items-center gap-2 text-xs cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#8B9A47] focus:ring-[#8B9A47]"
                                        checked={checked}
                                        onChange={() =>
                                          setSelectedSubcategoryIds((prev) =>
                                            checked
                                              ? prev.filter(
                                                  (id) => id !== s.id
                                                )
                                              : [...prev, s.id]
                                          )
                                        }
                                      />
                                      <span className="text-gray-700">
                                        {s.name}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                                Для цієї категорії немає підкатегорій або вони ще
                                не завантажені.
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {selectedSubcategoryIds.length > 0 && (
                        <p className="text-[11px] text-gray-500">
                          Вибрано підкатегорій:{" "}
                          <span className="font-medium">
                            {selectedSubcategoryIds.length}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Деталі товару" className="mt-4 sm:mt-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label>ДІЯ АКТИВНИХ КОМПОНЕНТІВ</Label>
                  <TextArea
                    value={mainAction}
                    onChange={setMainAction}
                    rows={4}
                  />
                </div>
                <div>
                  <Label>СКЛАД</Label>
                  <TextArea
                    value={fullComposition}
                    onChange={setFullComposition}
                    rows={3}
                    placeholder="Повний склад продукту"
                  />
                </div>
                <div>
                  <Label>СПОСІБ ВИКОРИСТАННЯ</Label>
                  <TextArea
                    value={usageMethod}
                    onChange={setUsageMethod}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>ПРОТИПОКАЗАННЯ</Label>
                  <TextArea
                    value={contraindications}
                    onChange={setContraindications}
                    rows={2}
                  />
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Налаштування та ціни" className="mt-4 sm:mt-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Бестселлер</Label>
                  <ToggleSwitch enabled={bestseller} setEnabled={setBestseller} label="Бестселлер" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">В наявності</Label>
                  <ToggleSwitch enabled={inStock} setEnabled={setInStock} label="В наявності" />
                </div>
                <div>
                  <Label>Пріоритет показу</Label>
                  <Input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Кількість на складі</Label>
                  <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Right side: Медіа товарів */}
          <div className="min-w-0 p-0 sm:p-2 md:p-4">
            <ComponentCard title="Медіа товарів">
              <p className="text-sm text-gray-500 mb-4">Додайте фото або відео товару. Перше медіа буде головним.</p>
              <DropzoneComponent onDrop={handleDrop} />
            {/* {images.length > 0 &&
              images.map((file, i) => {
                const previewUrl = URL.createObjectURL(file);
                const isVideo = file.type.startsWith("video/");
                return (
                  <div key={`new-${i}`} className="relative inline-block mt-4">
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoadedData={() => URL.revokeObjectURL(previewUrl)}
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                );
              })} */}

            {mediaFiles.length > 0 &&
              mediaFiles.map((media, i) => {
                const previewUrl = URL.createObjectURL(media.file);
                const isVideo = media.type === "video";
                
                console.log('[Preview] File:', media.file.name, 'Type:', media.type, 'Is video:', isVideo, 'MIME:', media.file.type);

                return (
                  <div
                    key={`media-${i}`}
                    className="relative inline-block mt-4 mx-2"
                  >
                    <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                      #{i + 1}
                    </span>

                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        onLoadedData={() => {
                          console.log('[Preview] Video loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                        onError={(e) => {
                          console.error('[Preview] Video error:', e);
                        }}
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={media.file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        unoptimized
                        onLoadingComplete={() => {
                          console.log('[Preview] Image loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                      />
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setMediaFiles((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>

                    {/* Reorder Buttons */}
                    <div className="flex justify-center gap-1 mt-2">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i - 1], newArr[i]] = [
                              newArr[i],
                              newArr[i - 1],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === mediaFiles.length - 1}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i], newArr[i + 1]] = [
                              newArr[i + 1],
                              newArr[i],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </ComponentCard>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-0 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 sm:px-8 rounded-lg text-sm font-medium disabled:opacity-50 touch-manipulation"
            disabled={loading}
          >
            {loading ? "Збереження..." : "Створити Товар"}
          </button>
        </div>

        {success && <div className="text-green-600 text-center text-sm sm:text-base">{success}</div>}
        {error && <div className="text-red-600 text-center text-sm sm:text-base">{error}</div>}
      </form>
    </div>
  );
}
