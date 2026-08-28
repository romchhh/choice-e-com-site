"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import { normalizeProductPricing, parseOptionalNumber } from "@/lib/pricing";
import CompositionItemsEditor from "@/components/admin/CompositionItemsEditor";
import ProductReviewsEditor from "@/components/admin/ProductReviewsEditor";
import {
  normalizeCompositionItems,
  type CompositionItem,
} from "@/lib/productComposition";

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
    courseDays: "",
    packageWeight: "",
    mainInfo: "",
    shortDescription: "",
    description: "",
    mainAction: "",
    indicationsForUse: "",
    benefits: "",
    fullComposition: "",
    compositionItems: [] as CompositionItem[],
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
    limitedEdition: false,
    inStock: true,
    isHit: false,
    dietitianApproved: false,
    isPromo: false,
    freeDeliveryBadge: false,
    doctorChoiceBadge: false,
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
  const [productOptions, setProductOptions] = useState<
    {
      id: number;
      name: string;
      slug?: string | null;
      first_media?: { url: string; type: string } | null;
      category_id?: number | null;
      category_ids?: number[] | null;
    }[]
  >([]);
  const [giftProductId, setGiftProductId] = useState<number | null>(null);
  const [boughtTogetherIds, setBoughtTogetherIds] = useState<number[]>([]);
  const [pairTogetherIds, setPairTogetherIds] = useState<number[]>([]);
  /** Модальне вікно: «разом» / «пара» / подарунок (один товар) */
  const [bundleModal, setBundleModal] = useState<null | "bought" | "pair" | "gift">(null);
  const [modalSearch, setModalSearch] = useState("");
  const [modalCategoryId, setModalCategoryId] = useState<number | null>(null);
  const [modalDraftIds, setModalDraftIds] = useState<number[]>([]);
  const [modalGiftDraftId, setModalGiftDraftId] = useState<number | null>(null);
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
        const [productRes, categoriesRes, productsRes] = await Promise.all([
          // Без кешу: інакше можна отримати застарілі category_ids і при наступному збереженні перезаписати БД старими галочками
          fetch(`/api/products/${productId}`, { cache: "no-store" }),
          fetch(`/api/categories`, { cache: "no-store" }),
          fetch(`/api/products?limit=5000&offset=0`, { cache: "no-store" }),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoriesRes.json();
        const productsData = await productsRes.json();
        
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
          courseDays:
            productData.course_days != null
              ? String(productData.course_days)
              : "",
          packageWeight: productData.package_weight || "",
          mainInfo: productData.main_info || "",
          shortDescription: productData.short_description || "",
          description: productData.description || "",
          mainAction: productData.main_action || "",
          indicationsForUse: productData.indications_for_use || "",
          benefits: productData.benefits || "",
          fullComposition: productData.full_composition || "",
          compositionItems: normalizeCompositionItems(
            productData.composition_items
          ),
          usageMethod: productData.usage_method || "",
          contraindications: productData.contraindications || "",
          storageConditions: productData.storage_conditions || "",
          ...(() => {
            const pricing = normalizeProductPricing(
              Number(productData.price || 0),
              parseOptionalNumber(productData.old_price),
              parseOptionalNumber(productData.discount_percentage)
            );
            return {
              price: String(pricing.price || ""),
              oldPrice:
                pricing.old_price != null ? String(pricing.old_price) : "",
              discountPercentage:
                pricing.discount_percentage != null
                  ? String(pricing.discount_percentage)
                  : "",
            };
          })(),
          priority: String(productData.priority || 0),
          stock: String(productData.stock ?? 0),
          media: mediaArray,
          topSale: productData.top_sale || false,
          limitedEdition: productData.limited_edition === true,
          inStock: productData.in_stock !== false,
          isHit: productData.is_hit === true,
          dietitianApproved: productData.dietitian_approved === true,
          isPromo: productData.is_promo === true,
          freeDeliveryBadge: productData.free_delivery_badge === true,
          doctorChoiceBadge: productData.doctor_choice_badge === true,
        });

        setCategoryOptions(categoryData);
        setProductOptions(
          Array.isArray(productsData)
            ? productsData.map((p: any) => ({
                id: Number(p.id),
                name: String(p.name ?? ""),
                slug: p.slug ?? null,
                first_media: p.first_media ?? null,
                category_id: p.category_id ?? null,
                category_ids: Array.isArray(p.category_ids) ? p.category_ids : null,
              }))
            : []
        );

        setGiftProductId(
          productData.gift_product_id != null ? Number(productData.gift_product_id) : null
        );
        setBoughtTogetherIds(
          Array.isArray(productData.bought_together_ids)
            ? productData.bought_together_ids.map((x: any) => Number(x)).filter((n: number) => Number.isInteger(n) && n > 0)
            : []
        );
        setPairTogetherIds(
          Array.isArray(productData.pair_together_ids)
            ? productData.pair_together_ids.map((x: any) => Number(x)).filter((n: number) => Number.isInteger(n) && n > 0)
            : []
        );

        // Попередньо завантажимо підкатегорії для всіх категорій товару
        const subMap: Record<number, { id: number; name: string }[]> = {};
        for (const catId of allCategoryIds) {
          try {
            const res = await fetch(
              `/api/subcategories?parent_category_id=${catId}`,
              { cache: "no-store" }
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

  useEffect(() => {
    if (!bundleModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBundleModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [bundleModal]);

  const loadSubcategoriesForCategory = async (categoryId: number) => {
    if (subcategoriesByCategory[categoryId]) return;

    try {
      const res = await fetch(
        `/api/subcategories?parent_category_id=${categoryId}`,
        { cache: "no-store" }
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

  const toggleIdInList = (id: number, list: number[], setList: (next: number[]) => void) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  const openBundleModal = (kind: "bought" | "pair") => {
    setBundleModal(kind);
    setModalSearch("");
    setModalCategoryId(null);
    setModalDraftIds(kind === "bought" ? [...boughtTogetherIds] : [...pairTogetherIds]);
  };

  const openGiftModal = () => {
    setBundleModal("gift");
    setModalSearch("");
    setModalCategoryId(null);
    setModalGiftDraftId(giftProductId);
  };

  const closeBundleModal = () => {
    setBundleModal(null);
  };

  const applyBundleModal = () => {
    if (bundleModal === "bought") setBoughtTogetherIds(modalDraftIds);
    if (bundleModal === "pair") setPairTogetherIds(modalDraftIds);
    if (bundleModal === "gift") setGiftProductId(modalGiftDraftId);
    setBundleModal(null);
  };

  const modalFilteredProducts = useMemo(() => {
    if (!bundleModal) return [];
    const q = modalSearch.trim().toLowerCase();
    return productOptions.filter((p) => {
      if (p.id === Number(productId)) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (modalCategoryId != null) {
        const ids = new Set<number>([
          ...(p.category_ids ?? []),
          ...(p.category_id != null ? [p.category_id] : []),
        ]);
        if (!ids.has(modalCategoryId)) return false;
      }
      return true;
    });
  }, [bundleModal, productOptions, productId, modalSearch, modalCategoryId]);

  const getProductRow = (id: number) => productOptions.find((p) => p.id === id);

  const removeFromBundle = (kind: "bought" | "pair", id: number) => {
    if (kind === "bought") setBoughtTogetherIds((prev) => prev.filter((x) => x !== id));
    else setPairTogetherIds((prev) => prev.filter((x) => x !== id));
  };

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

      const pricing = normalizeProductPricing(
        Number(formData.price),
        parseOptionalNumber(formData.oldPrice),
        parseOptionalNumber(formData.discountPercentage)
      );

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
          course_days: formData.courseDays
            ? Number(formData.courseDays) || null
            : null,
          package_weight: formData.packageWeight || null,
          main_info: formData.mainInfo || null,
          short_description: formData.shortDescription || null,
          description: formData.description || null,
          main_action: formData.mainAction || null,
          indications_for_use: formData.indicationsForUse || null,
          benefits: formData.benefits || null,
          full_composition: formData.fullComposition || null,
          composition_items: formData.compositionItems,
          usage_method: formData.usageMethod || null,
          contraindications: formData.contraindications || null,
          storage_conditions: formData.storageConditions || null,
          price: pricing.price,
          old_price: pricing.old_price,
          discount_percentage: pricing.discount_percentage,
          priority: Number(formData.priority),
          stock: Number(formData.stock) || 0,
          media: updatedMedia,
          top_sale: formData.topSale,
          limited_edition: formData.limitedEdition,
          in_stock: formData.inStock,
          is_hit: formData.isHit,
          dietitian_approved: formData.dietitianApproved,
          is_promo: formData.isPromo,
          free_delivery_badge: formData.freeDeliveryBadge,
          doctor_choice_badge: formData.doctorChoiceBadge,
          gift_product_id: giftProductId,
          bought_together_ids: boughtTogetherIds,
          pair_together_ids: pairTogetherIds,
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
        <>
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
                    <Label>Курс (текст для картки)</Label>
                    <Input
                      type="text"
                      value={formData.course}
                      onChange={(e) =>
                        handleChange("course", e.target.value)
                      }
                      placeholder="Напр. рекомендований курс 30 днів"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Це опис курсу для покупця, не для калькулятора.
                    </p>
                  </div>
                </div>
                  <div>
                    <Label>Скільки днів вистачає 1 упаковки</Label>
                    <p className="mb-2 text-xs text-gray-500">
                      Саме це поле керує калькулятором. Фіто (30 капсул) ={" "}
                      <strong>15</strong>, Pro Healthy (60 капсул) ={" "}
                      <strong>30</strong>. Приклад: 15 днів → 1 міс. = 2 уп.,
                      2 міс. = 4 уп.
                    </p>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {[
                        { days: "15", label: "15 дн. · Фіто" },
                        { days: "30", label: "30 дн. · Pro Healthy" },
                        { days: "60", label: "60 дн." },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => handleChange("courseDays", preset.days)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            formData.courseDays === preset.days
                              ? "border-[#3D1A00] bg-[#3D1A00] text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-[#8B9A47]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      value={formData.courseDays}
                      onChange={(e) =>
                        handleChange("courseDays", e.target.value)
                      }
                      placeholder="Напр. 15"
                      min="1"
                    />
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

              <ComponentCard title="Склад, застосування та ефект" className="mt-4 sm:mt-6">
                <div className="space-y-5 sm:space-y-6">
                  <CompositionItemsEditor
                    items={formData.compositionItems}
                    onChange={(items) =>
                      handleChange("compositionItems", items)
                    }
                  />
                  <div>
                    <Label>СКЛАД (текстом, опційно)</Label>
                    <p className="mb-1 text-xs text-gray-500">
                      Якщо не додаєте окремі компоненти вище — можна вписати
                      склад суцільним текстом.
                    </p>
                    <TextArea
                      value={formData.fullComposition}
                      onChange={(v) => handleChange("fullComposition", v)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>СПОСІБ ЗАСТОСУВАННЯ / ДОЗУВАННЯ</Label>
                    <TextArea
                      value={formData.usageMethod}
                      onChange={(v) => handleChange("usageMethod", v)}
                      rows={4}
                      placeholder="Як приймати, дозування, курс"
                    />
                  </div>
                  <div>
                    <Label>ОЧІКУВАНИЙ ЕФЕКТ</Label>
                    <TextArea
                      value={formData.mainAction}
                      onChange={(v) => handleChange("mainAction", v)}
                      rows={4}
                      placeholder="Що дає продукт, результат курсу"
                    />
                  </div>
                  <div>
                    <Label>ДОДАТКОВІ ПЕРЕВАГИ (опційно)</Label>
                    <TextArea
                      value={formData.benefits}
                      onChange={(v) => handleChange("benefits", v)}
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
                  <Label className="mb-0">Новинка Choice</Label>
                  <ToggleSwitch
                    enabled={formData.limitedEdition}
                    setEnabled={(v) => handleChange("limitedEdition", v)}
                    label="Новинка"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">В наявності</Label>
                  <ToggleSwitch enabled={formData.inStock} setEnabled={(v) => handleChange("inStock", v)} label="В наявності" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Хіт</Label>
                  <ToggleSwitch enabled={formData.isHit} setEnabled={(v) => handleChange("isHit", v)} label="Хіт" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Схвалено асоціацією дієтологів</Label>
                  <ToggleSwitch
                    enabled={formData.dietitianApproved}
                    setEnabled={(v) => handleChange("dietitianApproved", v)}
                    label="Схвалено"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="max-w-[min(100%,14rem)] sm:max-w-none">
                    <Label className="mb-0">Плашка «Акція»</Label>
                    <p className="mt-1 text-[11px] leading-snug text-gray-500">
                      Товар з&apos;явиться у блоці «Спеціальні пропозиції» на головній.
                    </p>
                  </div>
                  <ToggleSwitch enabled={formData.isPromo} setEnabled={(v) => handleChange("isPromo", v)} label="Акція" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0 max-w-[min(100%,14rem)] text-xs leading-snug sm:max-w-none sm:text-sm">
                    Безкоштовна доставка від 2&nbsp;000&nbsp;грн (плашка)
                  </Label>
                  <ToggleSwitch
                    enabled={formData.freeDeliveryBadge}
                    setEnabled={(v) => handleChange("freeDeliveryBadge", v)}
                    label="Доставка"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0 max-w-[min(100%,14rem)] text-xs leading-snug sm:max-w-none sm:text-sm">
                    Безкоштовно DOCTOR CHOICE (плашка)
                  </Label>
                  <ToggleSwitch
                    enabled={formData.doctorChoiceBadge}
                    setEnabled={(v) => handleChange("doctorChoiceBadge", v)}
                    label="Doctor Choice"
                  />
                </div>
                <Label>Пріоритет показу</Label>
                <Input type="number" value={formData.priority} onChange={(e) => handleChange("priority", e.target.value)} placeholder="0" />
                <Label>Кількість на складі</Label>
                <Input type="number" min="0" value={String(formData.stock)} onChange={(e) => handleChange("stock", e.target.value)} placeholder="0" />
              </ComponentCard>

              <ComponentCard title="Подарунок та рекомендації" className="mt-4 sm:mt-6">
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Label className="mb-1">Подарунок до товару</Label>
                        <p className="text-[11px] text-gray-500">
                          Товар також потрапляє у «Спеціальні пропозиції» на головній.
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Обрано:{" "}
                          <span className="font-semibold text-gray-700">
                            {giftProductId ? "1" : "0"}
                          </span>
                          {giftProductId ? (
                            <span className="text-gray-600">
                              {" "}
                              — {getProductRow(giftProductId)?.name ?? "товар"}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={openGiftModal}
                          className="rounded-lg bg-[#3D1A00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                        >
                          Додати товар
                        </button>
                        {giftProductId != null && (
                          <button
                            type="button"
                            onClick={() => setGiftProductId(null)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Очистити
                          </button>
                        )}
                      </div>
                    </div>
                    {giftProductId != null && (() => {
                      const row = getProductRow(giftProductId);
                      if (!row) return null;
                      const thumb =
                        row.first_media?.type === "photo" && row.first_media.url
                          ? `/api/images/${row.first_media.url}`
                          : null;
                      return (
                        <div className="mt-3 flex max-w-[260px] items-center gap-2 rounded-lg border border-gray-200 bg-white py-1 pl-1 pr-2 shadow-sm">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {thumb ? (
                              <Image src={thumb} alt="" fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                —
                              </div>
                            )}
                          </div>
                          <span className="line-clamp-2 text-[11px] font-medium text-gray-800">
                            {row.name}
                          </span>
                          <button
                            type="button"
                            title="Прибрати подарунок"
                            onClick={() => setGiftProductId(null)}
                            className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Label className="mb-1">З цим товаром купують / Купують разом</Label>
                        <p className="text-[11px] text-gray-500">
                          Обрано товарів:{" "}
                          <span className="font-semibold text-gray-700">{boughtTogetherIds.length}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openBundleModal("bought")}
                          className="rounded-lg bg-[#3D1A00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                        >
                          Додати товари
                        </button>
                        {boughtTogetherIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setBoughtTogetherIds([])}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Очистити
                          </button>
                        )}
                      </div>
                    </div>
                    {boughtTogetherIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {boughtTogetherIds.map((id) => {
                          const row = getProductRow(id);
                          if (!row) return null;
                          const thumb =
                            row.first_media?.type === "photo" && row.first_media.url
                              ? `/api/images/${row.first_media.url}`
                              : null;
                          return (
                            <div
                              key={id}
                              className="flex max-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-white py-1 pl-1 pr-2 shadow-sm"
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                {thumb ? (
                                  <Image src={thumb} alt="" fill className="object-cover" sizes="40px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                    —
                                  </div>
                                )}
                              </div>
                              <span className="line-clamp-2 text-[11px] font-medium text-gray-800">
                                {row.name}
                              </span>
                              <button
                                type="button"
                                title="Прибрати"
                                onClick={() => removeFromBundle("bought", id)}
                                className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Label className="mb-1">Обирай у парі / Купуй разом (після «Схожі товари»)</Label>
                        <p className="text-[11px] text-gray-500">
                          Обрано товарів:{" "}
                          <span className="font-semibold text-gray-700">{pairTogetherIds.length}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openBundleModal("pair")}
                          className="rounded-lg bg-[#3D1A00] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90"
                        >
                          Додати товари
                        </button>
                        {pairTogetherIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPairTogetherIds([])}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Очистити
                          </button>
                        )}
                      </div>
                    </div>
                    {pairTogetherIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pairTogetherIds.map((id) => {
                          const row = getProductRow(id);
                          if (!row) return null;
                          const thumb =
                            row.first_media?.type === "photo" && row.first_media.url
                              ? `/api/images/${row.first_media.url}`
                              : null;
                          return (
                            <div
                              key={id}
                              className="flex max-w-[220px] items-center gap-2 rounded-lg border border-gray-200 bg-white py-1 pl-1 pr-2 shadow-sm"
                            >
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                {thumb ? (
                                  <Image src={thumb} alt="" fill className="object-cover" sizes="40px" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                    —
                                  </div>
                                )}
                              </div>
                              <span className="line-clamp-2 text-[11px] font-medium text-gray-800">
                                {row.name}
                              </span>
                              <button
                                type="button"
                                title="Прибрати"
                                onClick={() => removeFromBundle("pair", id)}
                                className="ml-auto shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
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

        {productId && !Number.isNaN(Number(productId)) ? (
          <ProductReviewsEditor
            productId={Number(productId)}
            productName={formData.name || undefined}
          />
        ) : null}
        </>
      )}

      {bundleModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bundle-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBundleModal();
          }}
        >
          <div
            className="flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div>
                <h2
                  id="bundle-modal-title"
                  className="text-base font-semibold text-gray-900 sm:text-lg"
                >
                  {bundleModal === "bought"
                    ? "Додати товари — купують разом"
                    : bundleModal === "pair"
                    ? "Додати товари — купуй разом"
                    : "Обрати подарунок"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {bundleModal === "gift"
                    ? "Категорії, пошук і картки з фото. Можна обрати один товар або «Без подарунка»."
                    : "Фільтр за категорією, пошук за назвою, клік по картці — вибір кількох товарів."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBundleModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            <div className="shrink-0 space-y-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-6">
              <Input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Пошук за назвою…"
              />
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => setModalCategoryId(null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    modalCategoryId === null
                      ? "bg-[#3D1A00] text-white"
                      : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Усі категорії
                </button>
                {categoryOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setModalCategoryId(c.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      modalCategoryId === c.id
                        ? "bg-[#8B9A47] text-white"
                        : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {bundleModal === "gift" && (
                <button
                  type="button"
                  onClick={() => setModalGiftDraftId(null)}
                  className={`mb-4 w-full rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    modalGiftDraftId === null
                      ? "border-[#8B9A47] bg-[#8B9A47]/10 ring-2 ring-[#8B9A47]/25"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900">Без подарунка</span>
                  <span className="mt-0.5 block text-xs font-normal text-gray-500">
                    Подарунок не показуватиметься для цього товару
                  </span>
                </button>
              )}

              {modalFilteredProducts.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-500">
                  Нічого не знайдено. Спробуйте змінити пошук або категорію.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {modalFilteredProducts.map((p) => {
                    const selected =
                      bundleModal === "gift"
                        ? modalGiftDraftId === p.id
                        : modalDraftIds.includes(p.id);
                    const isPhoto = p.first_media?.type === "photo" && p.first_media.url;
                    const src = isPhoto ? `/api/images/${p.first_media!.url}` : null;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (bundleModal === "gift") {
                            setModalGiftDraftId((prev) => (prev === p.id ? null : p.id));
                          } else {
                            toggleIdInList(p.id, modalDraftIds, setModalDraftIds);
                          }
                        }}
                        className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-all ${
                          selected
                            ? "border-[#8B9A47] ring-2 ring-[#8B9A47]/30"
                            : "border-gray-100 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="relative aspect-square w-full bg-gray-100">
                          {src ? (
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 45vw, 20vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-medium text-gray-400">
                              {p.first_media?.type === "video" ? "Відео" : "Немає фото"}
                            </div>
                          )}
                          <span
                            className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow ${
                              selected
                                ? "bg-[#8B9A47] text-white"
                                : "bg-white/90 text-gray-400 ring-1 ring-gray-200"
                            }`}
                            aria-hidden
                          >
                            {selected ? "✓" : ""}
                          </span>
                        </div>
                        <div className="border-t border-gray-100 p-2">
                          <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-gray-900">
                            {p.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm text-gray-600">
                {bundleModal === "gift" ? (
                  <>
                    <span className="min-w-0 truncate">
                      Подарунок:{" "}
                      <span className="font-semibold text-gray-900">
                        {modalGiftDraftId
                          ? getProductRow(modalGiftDraftId)?.name ?? "—"
                          : "не обрано"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalGiftDraftId(null)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Очистити вибір
                    </button>
                  </>
                ) : (
                  <>
                    <span>
                      Обрано:{" "}
                      <span className="font-semibold text-gray-900">{modalDraftIds.length}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalDraftIds([])}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Очистити вибір
                    </button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closeBundleModal}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={applyBundleModal}
                  className="rounded-lg bg-[#3D1A00] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
