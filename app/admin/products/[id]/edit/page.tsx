"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

type MediaFile = {
  id?: number; // for existing ones
  file?: File; // for new uploads
  url?: string; // for existing ones
  preview?: string; // for new ones (via URL.createObjectURL)
  type: "photo" | "video";
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    releaseForm: "",
    course: "",
    packageWeight: "",
    mainInfo: "",
    shortDescription: "",
    description: "",
    mainAction: "",
    indicationsForUse: "",
    benefits: "",
    fullComposition: "",
    usageMethod: "",
    contraindications: "",
    storageConditions: "",
    price: "",
    oldPrice: "",
    discountPercentage: "",
    priority: "0",
    stock: "0",
    media: [] as { type: string; url: string }[],
    topSale: false,
    inStock: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<
    Record<number, { id: number; name: string }[]>
  >({});
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    number[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          // Без кешу: інакше можна отримати застарілі category_ids і при наступному збереженні перезаписати БД старими галочками
          fetch(`/api/products/${productId}`, { cache: "no-store" }),
          fetch(`/api/categories`, { cache: "no-store" }),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoriesRes.json();
        
        // Safely handle media data
        const mediaArray = Array.isArray(productData.media) ? productData.media : [];
        setMediaFiles(
          mediaArray.map((item: { url: string; type: string }) => ({
            type: item.type,
            url: item.url,
          }))
        );

        // Визначаємо всі категорії товару
        const allCategoryIds: number[] = Array.isArray(
          productData.category_ids
        )
          ? productData.category_ids
          : productData.category_id
          ? [productData.category_id]
          : [];
        // Визначаємо всі підкатегорії товару
        const allSubcategoryIds: number[] = Array.isArray(
          productData.subcategory_ids
        )
          ? productData.subcategory_ids
          : productData.subcategory_id
          ? [productData.subcategory_id]
          : [];
        const primaryCategoryId: number | null =
          productData.category_id ?? allCategoryIds[0] ?? null;
        const primarySubcategoryId: number | null =
          productData.subcategory_id ?? allSubcategoryIds[0] ?? null;

        setSelectedCategoryIds(allCategoryIds);
        setSelectedSubcategoryIds(allSubcategoryIds);

        setFormData({
          name: productData.name || "",
          subtitle: productData.subtitle || "",
          releaseForm: productData.release_form || "",
          course: productData.course || "",
          packageWeight: productData.package_weight || "",
          mainInfo: productData.main_info || "",
          shortDescription: productData.short_description || "",
          description: productData.description || "",
          mainAction: productData.main_action || "",
          indicationsForUse: productData.indications_for_use || "",
          benefits: productData.benefits || "",
          fullComposition: productData.full_composition || "",
          usageMethod: productData.usage_method || "",
          contraindications: productData.contraindications || "",
          storageConditions: productData.storage_conditions || "",
          price: String(productData.price || ""),
          oldPrice: String(productData.old_price || ""),
          discountPercentage: String(productData.discount_percentage || ""),
          priority: String(productData.priority || 0),
          stock: String(productData.stock ?? 0),
          media: mediaArray,
          topSale: productData.top_sale || false,
          inStock: productData.in_stock !== false,
        });

        setCategoryOptions(categoryData);

        // Попередньо завантажимо підкатегорії для всіх категорій товару
        const subMap: Record<number, { id: number; name: string }[]> = {};
        for (const catId of allCategoryIds) {
          try {
            const res = await fetch(
              `/api/subcategories?parent_category_id=${catId}`
            );
            if (!res.ok) continue;
            const data = await res.json();
            subMap[catId] = data;
          } catch {
            // тихо ігноруємо помилку, підкатегорії можна буде дозавантажити пізніше
          }
        }
        setSubcategoriesByCategory(subMap);
      } catch (err) {
        console.error("Failed to fetch product or categories", err);
        setError("Помилка при завантаженні товару або категорій");
      } finally {
        setLoadingData(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const loadSubcategoriesForCategory = async (categoryId: number) => {
    if (subcategoriesByCategory[categoryId]) return;

    try {
      const res = await fetch(
        `/api/subcategories?parent_category_id=${categoryId}`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      const data = await res.json();
      setSubcategoriesByCategory((prev) => ({
        ...prev,
        [categoryId]: data,
      }));
    } catch (error) {
      console.error("Error fetching subcategories", error);
    }
  };

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  const handleDrop = (files: File[]) => {
    console.log('[EditProduct] handleDrop called with files:', files);
    
    // Add to images state (for new uploads)
    setImages((prev) => [...prev, ...files]);
    
    // Also add to mediaFiles for preview with metadata
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith("video/")
        ? "video"
        : "photo") as MediaFile["type"],
    }));

    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  // Reorder for existing images
  const moveExistingMedia = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.media];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, media: updated };
    });
  };

  // Reorder for new images
  const moveNewImage = (fromIndex: number, toIndex: number) => {
    console.log('[EditProduct] Moving new image from', fromIndex, 'to', toIndex);
    
    // Get only new files (with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const existingMedia = mediaFiles.filter((m) => !m.file);
    
    const updated = [...newMediaFiles];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    setMediaFiles([...existingMedia, ...updated]);
    
    // Also update images state
    setImages(updated.map((m) => m.file!));
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleDeleteNewImage = (indexToRemove: number) => {
    console.log('[EditProduct] Deleting new image at index:', indexToRemove);
    
    // Get all new media files (those with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const itemToDelete = newMediaFiles[indexToRemove];
    
    // Revoke object URL to prevent memory leak
    if (itemToDelete?.preview) {
      URL.revokeObjectURL(itemToDelete.preview);
    }
    
    // Remove from images state
    const newMediaFilesArray = mediaFiles.filter((m) => m.file).map((m) => m.file).filter((f): f is File => !!f);
    const newImages = newMediaFilesArray.filter((_, i) => i !== indexToRemove);
    setImages(newImages);
    
    // Remove from mediaFiles state
    setMediaFiles((prev) => {
      const newFiles = prev.filter((m) => m.file);
      const rest = prev.filter((m) => !m.file);
      const updatedNewFiles = newFiles.filter((_, i) => i !== indexToRemove);
      return [...rest, ...updatedNewFiles];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      console.log('[EditProduct] Submitting form. Images to upload:', images.length);
      
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];

      if (images.length > 0) {
        console.log('[EditProduct] Uploading new images:', images.map(f => f.name));
        
        const uploadForm = new FormData();
        images.forEach((img) => uploadForm.append("images", img));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media;
        
        console.log('[EditProduct] Uploaded media:', uploadedMedia);
      }

      const updatedMedia = [...formData.media, ...uploadedMedia];

      const allCategoryIds = Array.from(new Set(selectedCategoryIds));
      const allSubcategoryIds = Array.from(new Set(selectedSubcategoryIds));
      const primaryCategoryId = allCategoryIds[0] ?? null;
      const primarySubcategoryId = allSubcategoryIds[0] ?? null;

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          subtitle: formData.subtitle || null,
          release_form: formData.releaseForm || null,
          course: formData.course || null,
          package_weight: formData.packageWeight || null,
          main_info: formData.mainInfo || null,
          short_description: formData.shortDescription || null,
          description: formData.description || null,
          main_action: formData.mainAction || null,
          indications_for_use: formData.indicationsForUse || null,
          benefits: formData.benefits || null,
          full_composition: formData.fullComposition || null,
          usage_method: formData.usageMethod || null,
          contraindications: formData.contraindications || null,
          storage_conditions: formData.storageConditions || null,
          price: Number(formData.price),
          old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
          discount_percentage: formData.discountPercentage ? Number(formData.discountPercentage) : null,
          priority: Number(formData.priority),
          stock: Number(formData.stock) || 0,
          media: updatedMedia,
          top_sale: formData.topSale,
          in_stock: formData.inStock,
          category_id: primaryCategoryId,
          subcategory_id: primarySubcategoryId,
          category_ids: allCategoryIds,
          subcategory_ids: allSubcategoryIds,
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setSuccess("Товар успішно оновлено");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити товар");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      {loadingData ? (
        <div className="p-4 text-center text-base sm:text-lg">Завантаження даних...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <PageBreadcrumb pageTitle="Редагувати Товар" />
          <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6">
            <div className="w-full min-w-0 md:w-1/2 p-0 sm:p-2 md:p-4">
              <ComponentCard title="Основна інформація">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label>Назва</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Форма випуску</Label>
                      <Input
                        type="text"
                        value={formData.releaseForm}
                        onChange={(e) =>
                          handleChange("releaseForm", e.target.value)
                        }
                        placeholder="Напр. 30 саше по 2 г"
                      />
                    </div>
                    <div>
                      <Label>Курс</Label>
                      <Input
                        type="text"
                        value={formData.course}
                        onChange={(e) =>
                          handleChange("course", e.target.value)
                        }
                        placeholder="Напр. 30 днів"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Основна інформація</Label>
                    <TextArea
                      value={formData.mainInfo}
                      onChange={(v) => handleChange("mainInfo", v)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>ОПИС</Label>
                    <TextArea
                      value={formData.description}
                      onChange={(v) => handleChange("description", v)}
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Ціна, стара ціна, знижка</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          handleChange("price", e.target.value)
                        }
                        placeholder="Ціна (грн)"
                      />
                      <Input
                        type="number"
                        value={formData.oldPrice}
                        onChange={(e) =>
                          handleChange("oldPrice", e.target.value)
                        }
                        placeholder="Стара ціна"
                      />
                      <Input
                        type="number"
                        value={formData.discountPercentage}
                        onChange={(e) =>
                          handleChange("discountPercentage", e.target.value)
                        }
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
                    {categoryOptions.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Категорії</p>
                          <button
                            type="button"
                            className="text-[11px] text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              if (selectedCategoryIds.length) {
                                setSelectedCategoryIds([]);
                                setSelectedSubcategoryIds([]);
                              } else {
                                const allIds = categoryOptions.map((c) => c.id);
                                setSelectedCategoryIds(allIds);
                              }
                            }}
                          >
                            {selectedCategoryIds.length
                              ? "Скинути всі"
                              : "Обрати всі"}
                          </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg px-3 py-2 space-y-1">
                          {categoryOptions.map((cat) => {
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
                                      setSelectedCategoryIds((prev) =>
                                        prev.filter((id) => id !== cat.id)
                                      );
                                      setSelectedSubcategoryIds((prev) =>
                                        prev.filter(
                                          (sid) =>
                                            !subcategoriesByCategory[
                                              cat.id
                                            ]?.some((s) => s.id === sid)
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
                                <span className="text-gray-700">
                                  {cat.name}
                                </span>
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
                                const mainCat = categoryOptions.find(
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
                          const cat = categoryOptions.find(
                            (c) => c.id === catId
                          );
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
                                      const allSelectedForCat =
                                        allIds.length > 0 &&
                                        allIds.every((id) =>
                                          selectedSubcategoryIds.includes(id)
                                        );

                                      if (allSelectedForCat) {
                                        setSelectedSubcategoryIds((prev) =>
                                          prev.filter(
                                            (id) => !allIds.includes(id)
                                          )
                                        );
                                      } else {
                                        setSelectedSubcategoryIds((prev) =>
                                          Array.from(
                                            new Set([...prev, ...allIds])
                                          )
                                        );
                                      }
                                    }}
                                  >
                                    {(() => {
                                      const allIds = subs.map((s) => s.id);
                                      const allSelectedForCat =
                                        allIds.length > 0 &&
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
                                  Для цієї категорії немає підкатегорій або вони
                                  ще не завантажені.
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
                      value={formData.mainAction}
                      onChange={(v) => handleChange("mainAction", v)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>СКЛАД</Label>
                    <TextArea
                      value={formData.fullComposition}
                      onChange={(v) => handleChange("fullComposition", v)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>СПОСІБ ВИКОРИСТАННЯ</Label>
                    <TextArea
                      value={formData.usageMethod}
                      onChange={(v) => handleChange("usageMethod", v)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>ПРОТИПОКАЗАННЯ</Label>
                    <TextArea
                      value={formData.contraindications}
                      onChange={(v) =>
                        handleChange("contraindications", v)
                      }
                      rows={2}
                    />
                  </div>
                </div>
              </ComponentCard>

              <ComponentCard title="Налаштування та ціни" className="mt-4 sm:mt-6">
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Бестселлер</Label>
                  <ToggleSwitch enabled={formData.topSale} setEnabled={(v) => handleChange("topSale", v)} label="Бестселлер" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">В наявності</Label>
                  <ToggleSwitch enabled={formData.inStock} setEnabled={(v) => handleChange("inStock", v)} label="В наявності" />
                </div>
                <Label>Пріоритет показу</Label>
                <Input type="number" value={formData.priority} onChange={(e) => handleChange("priority", e.target.value)} placeholder="0" />
                <Label>Кількість на складі</Label>
                <Input type="number" min="0" value={String(formData.stock)} onChange={(e) => handleChange("stock", e.target.value)} placeholder="0" />
              </ComponentCard>
            </div>

            <div className="w-full min-w-0 md:w-1/2 p-0 sm:p-2 md:p-4">
              <ComponentCard title="Медіа товарів">
                <DropzoneComponent onDrop={handleDrop} />
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {formData.media.map((item, i) => (
                  <div key={`existing-${i}`} className="relative inline-block">
                    {item.type === "video" ? (
                      <video
                        src={`/api/images/${item.url}`}
                        controls
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt={`media-${i}`}
                        width={128}
                        height={128}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="absolute top-1 left-1 flex gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i - 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="←"
                        >
                          ←
                        </button>
                      )}
                      {i < formData.media.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i + 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="→"
                        >
                          →
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {mediaFiles
                  .filter((m) => m.file) // Only show new files (with file property)
                  .map((media, i) => {
                    console.log('[EditProduct] Rendering new media preview:', media);
                    const previewUrl = media.preview || URL.createObjectURL(media.file!);
                    const isVideo = media.type === "video";
                    return (
                      <div key={`new-${i}`} className="relative inline-block">
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
                      <div className="absolute top-1 left-1 flex gap-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i - 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="←"
                          >
                            ←
                          </button>
                        )}
                        {i < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i + 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="→"
                          >
                            →
                          </button>
                        )}
                      </div>

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
                })}
                </div>
              </ComponentCard>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-4 sm:py-2 rounded-lg font-medium disabled:opacity-50 touch-manipulation"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти Зміни"}
            </button>

            {success && (
              <div className="text-green-600 text-center mt-2 text-sm sm:text-base">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-2 text-sm sm:text-base">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
