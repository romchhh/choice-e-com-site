"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarMenu from "../layout/SidebarMenu";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import ProductSkeleton from "./ProductSkeleton";
import { useSearchParams } from "next/navigation";
import { getDiscountedPrice } from "@/lib/pricing";
import {
  GA4_BRAND,
  GA4_CURRENCY,
  GA4_VERTICAL,
  pushGA4EcommerceEvent,
} from "@/lib/ga4Ecommerce";
import {
  LABEL_PRODUCT_COURSE,
  LABEL_PRODUCT_PACKAGE,
  SITE_STORE_NAME,
} from "@/lib/siteBrand";

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  description?: string | null;
  first_media?: { url: string; type: string } | null;
  discount_percentage?: number | null;
  category_id?: number | null;
  category_ids?: number[] | null;
   subcategory_id?: number | null;
   subcategory_ids?: number[] | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  stock?: number;
  in_stock?: boolean;
  package_weight?: string | null;
  course?: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface CatalogClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function CatalogClient({
  initialProducts,
  categories,
}: CatalogClientProps) {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { addItem } = useBasket();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"recommended" | "newest" | "asc" | "desc" | "sale">("recommended");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [subcategories, setSubcategories] = useState<
    { id: number; name: string; category_id: number }[]
  >([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [basketError, setBasketError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const initializedFromQueryRef = useRef(false);

  // Load all subcategories for filters
  useEffect(() => {
    let cancelled = false;
    async function loadSubcategories() {
      try {
        const res = await fetch("/api/subcategories");
        if (!res.ok) return;
        const data: { id: number; name: string; category_id: number }[] =
          await res.json();
        if (!cancelled) {
          setSubcategories(data);
        }
      } catch {
        // тихо ігноруємо помилку — фільтр за підкатегоріями просто не з'явиться
      }
    }
    loadSubcategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Init/override selection when приходимо з хедера по підкатегорії (?subcategory=...)
  useEffect(() => {
    if (!subcategories.length) return;

    const subName = searchParams.get("subcategory");
    if (!subName) return;

    const found = subcategories.find(
      (s) => s.name.toLowerCase() === subName.toLowerCase()
    );
    if (!found) return;

    initializedFromQueryRef.current = true;

    // Клік з хедера по підкатегорії завжди повністю перевизначає вибір
    setSelectedCategories([found.category_id]);
    setSelectedSubcategories([found.id]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [searchParams, subcategories]);

  // Init/override selection when приходимо з хедера по категорії (?categoryId=...)
  useEffect(() => {
    const catIdParam = searchParams.get("categoryId");
    if (!catIdParam) return;

    const idNum = Number(catIdParam);
    if (Number.isNaN(idNum)) return;

    const exists = categories.some((c) => c.id === idNum);
    if (!exists) return;

    // Клік з хедера по категорії завжди повністю перевизначає вибір
    setSelectedCategories([idNum]);
    setSelectedSubcategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [searchParams, categories]);

  const priceRange = useMemo(() => {
    if (initialProducts.length === 0) return { min: 0, max: 10000 };
    const prices = initialProducts.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const productCategoryIds =
        product.category_ids && product.category_ids.length > 0
          ? product.category_ids
          : product.category_id != null
          ? [product.category_id]
          : [];

      const productSubcategoryIds =
        product.subcategory_ids && product.subcategory_ids.length > 0
          ? product.subcategory_ids
          : product.subcategory_id != null
          ? [product.subcategory_id]
          : [];

      const matchesCategory =
        selectedCategories.length === 0 ||
        productCategoryIds.some((id) => selectedCategories.includes(id));
      const matchesSubcategory =
        selectedSubcategories.length === 0 ||
        productSubcategoryIds.some((id) => selectedSubcategories.includes(id));
      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;
      return (
        matchesCategory && matchesSubcategory && matchesMinPrice && matchesMaxPrice
      );
    });
  }, [initialProducts, minPrice, maxPrice, selectedCategories, selectedSubcategories]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 200);
    return () => clearTimeout(timer);
  }, [selectedCategories, selectedSubcategories, minPrice, maxPrice, sortOrder]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortOrder) {
      case "asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => b.id - a.id);
      case "sale":
        return sorted.sort((a, b) => {
          const aHasSale = a.discount_percentage ? 1 : 0;
          const bHasSale = b.discount_percentage ? 1 : 0;
          return bHasSale - aHasSale;
        });
      default:
        return sorted;
    }
  }, [filteredProducts, sortOrder]);

  const [visibleCount, setVisibleCount] = useState(9);
  const visibleProducts = useMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount]
  );

  const lastViewItemListSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isFiltering) return;
    if (visibleProducts.length === 0) return;

    const itemsForGA4 = visibleProducts.map((p) => {
      const unitPrice = getDiscountedPrice(p.price, p.discount_percentage);
      return {
        item_id: String(p.id),
        item_name: p.name,
        item_brand: GA4_BRAND,
        item_category: p.subcategory_name ?? p.category_name ?? "Каталог",
        price: unitPrice,
        quantity: 1,
        google_business_vertical: GA4_VERTICAL,
      };
    });

    // Simple dedupe to avoid firing on the same render
    const signature = JSON.stringify(itemsForGA4.map((i) => i.item_id));
    if (lastViewItemListSignatureRef.current === signature) return;
    lastViewItemListSignatureRef.current = signature;

    pushGA4EcommerceEvent("view_item_list", {
      currency: GA4_CURRENCY,
      items: itemsForGA4,
      value: itemsForGA4.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0),
    });
  }, [isFiltering, visibleProducts]);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setBasketError(null);
    // Зберігаємо в кошику той самий файл, що й на картці/сторінці товару
    const firstMediaUrl =
      product.first_media && "url" in product.first_media
        ? product.first_media.url
        : "";
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "—",
        quantity: 1,
        // В кошику / оформленні це перетворюється у `/api/images/<filename>`
        imageUrl: firstMediaUrl,
        discount_percentage: product.discount_percentage ?? undefined,
        category_name: product.subcategory_name ?? product.category_name ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Недостатньо товару в наявності";
      setBasketError(message);
      setTimeout(() => setBasketError(null), 5000);
    }
  };

  const handleApplyFilters = () => {
    setMinPrice(minPriceInput ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput ? Number(maxPriceInput) : null);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) => {
      // Якщо категорія вже вибрана — знімаємо її і чистимо її підкатегорії
      if (prev.includes(id)) {
        setSelectedSubcategories((prevSubs) =>
          prevSubs.filter((scId) => {
            const sc = subcategories.find((s) => s.id === scId);
            return !sc || sc.category_id !== id;
          })
        );
        return prev.filter((c) => c !== id);
      }
      // Якщо не вибрана — додаємо до списку (можна кілька категорій)
      return [...prev, id];
    });
  };

  const toggleSubcategory = (id: number) => {
    setSelectedSubcategories((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const visibleSubcategories = useMemo(() => {
    if (selectedCategories.length === 1) {
      return subcategories.filter(
        (sc) => sc.category_id === selectedCategories[0]
      );
    }
    return subcategories;
  }, [subcategories, selectedCategories]);

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-20 bg-white min-h-screen">
        {/* Breadcrumbs */}
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-gray-400">
            <li>
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Головна
              </Link>
            </li>
            <li aria-hidden className="text-gray-300">|</li>
            <li className="text-[#3D1A00]">Каталог товарів</li>
          </ol>
        </nav>

        {/* Великий заголовок по центру */}
        <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-10">
          Каталог товарів
        </h1>

        {/* Мобільна кнопка фільтрів — відкриває ті самі фільтри, що й на десктопі */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-['Montserrat'] text-gray-700 hover:border-gray-400 transition-colors"
        >
          <span className="text-lg">≡</span> Фільтри
        </button>

        {/* Мобільна панель фільтрів — ті самі Ціна, Категорія, Очистити, Застосувати */}
        {mobileFiltersOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden
            />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00]">
                  Фільтри
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  aria-label="Закрити фільтри"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 p-4 space-y-6">
                {/* Ціна */}
                <div>
                  <h3 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                    Ціна
                  </h3>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">Від</label>
                      <input
                        type="number"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        placeholder="Грн"
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">До</label>
                      <input
                        type="number"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        placeholder="Грн"
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {/* Категорія товару + підкатегорії під вибраною категорією */}
                <div>
                  <h3 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                    Категорія товару
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {categories.map((cat) => {
                      const isActive = selectedCategories.includes(cat.id);
                      const catSubcategories = subcategories.filter(
                        (sc) => sc.category_id === cat.id
                      );
                      return (
                        <li key={cat.id} className="flex flex-col gap-1">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <span
                              className={`w-4 h-4 flex-shrink-0 border rounded-sm transition-colors ${
                                isActive
                                  ? "bg-[#8B9A47] border-[#8B9A47]"
                                  : "border-gray-300 group-hover:border-gray-500"
                              }`}
                              onClick={() => toggleCategory(cat.id)}
                            >
                              {isActive && (
                                <svg
                                  viewBox="0 0 12 10"
                                  fill="none"
                                  className="w-full h-full p-0.5"
                                >
                                  <path
                                    d="M1 5l3 3 7-7"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span
                              className="text-sm font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                              onClick={() => toggleCategory(cat.id)}
                            >
                              {cat.name}
                            </span>
                          </label>

                          {/* Підкатегорії цієї категорії під вибраною категорією */}
                          {isActive && catSubcategories.length > 0 && (
                            <ul className="ml-6 mt-1 flex flex-col gap-1 max-h-40 overflow-y-auto">
                              {catSubcategories.map((sc) => {
                                const scActive = selectedSubcategories.includes(
                                  sc.id
                                );
                                return (
                                  <li key={sc.id}>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                      <span
                                        className={`w-3.5 h-3.5 flex-shrink-0 border rounded-sm transition-colors ${
                                          scActive
                                            ? "bg-[#8B9A47] border-[#8B9A47]"
                                            : "border-gray-300 group-hover:border-gray-500"
                                        }`}
                                        onClick={() => toggleSubcategory(sc.id)}
                                      >
                                        {scActive && (
                                          <svg
                                            viewBox="0 0 12 10"
                                            fill="none"
                                            className="w-full h-full p-[1px]"
                                          >
                                            <path
                                              d="M1 5l3 3 7-7"
                                              stroke="white"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        )}
                                      </span>
                                      <span
                                        className="text-xs font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                                        onClick={() => toggleSubcategory(sc.id)}
                                      >
                                        {sc.name}
                                      </span>
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {/* Кнопки */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded text-sm font-semibold font-['Montserrat'] text-gray-700 hover:border-gray-500 hover:text-[#3D1A00] transition-colors"
                  >
                    Очистити
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 py-2.5 px-4 bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded text-sm font-semibold font-['Montserrat'] transition-colors"
                  >
                    Застосувати
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Основний контент */}
        <div className="flex gap-8 lg:gap-10 items-start">
          {/* Sidebar фільтри — тільки десктоп */}
          <aside className="hidden lg:flex flex-col gap-6 w-[260px] flex-shrink-0">
            {/* Ціна */}
            <div>
              <h2 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                Ціна
              </h2>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">Від</label>
                  <input
                    type="number"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    placeholder="Грн"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-['Montserrat'] text-gray-500 mb-1">До</label>
                  <input
                    type="number"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    placeholder="Грн"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-['Montserrat'] text-gray-700 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Категорії + підкатегорії під вибраною категорією */}
            <div>
              <h2 className="text-base font-extrabold font-['Montserrat'] uppercase tracking-widest text-[#3D1A00] mb-3">
                Категорія товару
              </h2>
              <ul className="flex flex-col gap-2">
                {categories.map((cat) => {
                  const isActive = selectedCategories.includes(cat.id);
                  const catSubcategories = subcategories.filter(
                    (sc) => sc.category_id === cat.id
                  );
                  return (
                    <li key={cat.id} className="flex flex-col gap-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <span
                          className={`w-4 h-4 flex-shrink-0 border rounded-sm transition-colors ${
                            isActive
                              ? "bg-[#8B9A47] border-[#8B9A47]"
                              : "border-gray-300 group-hover:border-gray-500"
                          }`}
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {isActive && (
                            <svg
                              viewBox="0 0 12 10"
                              fill="none"
                              className="w-full h-full p-0.5"
                            >
                              <path
                                d="M1 5l3 3 7-7"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className="text-sm font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {cat.name}
                        </span>
                      </label>

                      {/* Підкатегорії цієї категорії під вибраною категорією */}
                      {isActive && catSubcategories.length > 0 && (
                        <ul className="ml-6 mt-1 flex flex-col gap-1 max-h-40 overflow-y-auto">
                          {catSubcategories.map((sc) => {
                            const scActive = selectedSubcategories.includes(
                              sc.id
                            );
                            return (
                              <li key={sc.id}>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <span
                                    className={`w-3.5 h-3.5 flex-shrink-0 border rounded-sm transition-colors ${
                                      scActive
                                        ? "bg-[#8B9A47] border-[#8B9A47]"
                                        : "border-gray-300 group-hover:border-gray-500"
                                    }`}
                                    onClick={() => toggleSubcategory(sc.id)}
                                  >
                                    {scActive && (
                                      <svg
                                        viewBox="0 0 12 10"
                                        fill="none"
                                        className="w-full h-full p-[1px]"
                                      >
                                        <path
                                          d="M1 5l3 3 7-7"
                                          stroke="white"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span
                                    className="text-xs font-['Montserrat'] text-gray-700 group-hover:text-[#3D1A00] transition-colors"
                                    onClick={() => toggleSubcategory(sc.id)}
                                  >
                                    {sc.name}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Кнопки фільтрів */}
            <div className="flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded text-sm font-semibold font-['Montserrat'] text-gray-700 hover:border-gray-500 hover:text-[#3D1A00] transition-colors"
              >
                Очистити
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 px-4 bg-[#8B9A47] hover:bg-[#7a8940] text-white rounded text-sm font-semibold font-['Montserrat'] transition-colors"
              >
                Застосувати
              </button>
            </div>
          </aside>

          {/* Сітка товарів */}
          <div className="flex-1 min-w-0">
            {/* Сортування та лічильник */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <p className="text-sm font-['Montserrat'] text-gray-500">
                Знайдено:{" "}
                <span className="font-semibold text-[#3D1A00]">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "товар" : "товарів"}
              </p>
              <label className="flex items-center gap-2">
                <span className="text-sm font-['Montserrat'] text-gray-500">Сортування:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="text-sm font-['Montserrat'] border border-gray-200 rounded px-3 py-2 bg-white text-[#3D1A00] focus:ring-2 focus:ring-[#8B9A47]/30 focus:border-[#8B9A47] outline-none"
                >
                  <option value="recommended">Рекомендовані</option>
                  <option value="newest">За новизною</option>
                  <option value="asc">Ціна: за зростанням</option>
                  <option value="desc">Ціна: за спаданням</option>
                  <option value="sale">Спочатку акційні</option>
                </select>
              </label>
            </div>

            {basketError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-['Montserrat'] text-red-700">
                {basketError}
              </div>
            )}

            {/* Картки товарів */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 sm:gap-x-5 sm:gap-y-3">
              {isFiltering ? (
                Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={`skeleton-${i}`} />
                ))
              ) : visibleProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <h3 className="text-xl font-bold font-['Montserrat'] uppercase tracking-wider text-[#3D1A00]">
                    Товарів не знайдено
                  </h3>
                  <p className="text-sm font-['Montserrat'] text-gray-400 text-center max-w-md">
                    Спробуйте змінити параметри фільтрів або перегляньте інші категорії
                  </p>
                </div>
              ) : (
                visibleProducts.map((product, index) => {
                  const outOfStock =
                    product.in_stock === false ||
                    (typeof product.stock === "number" && product.stock <= 0);
                  const displayPrice = product.discount_percentage
                    ? Math.round(product.price * (1 - product.discount_percentage / 100))
                    : product.price;
                  const rawDesc = product.description
                    ? product.description.replace(/<[^>]*>/g, "").trim()
                    : "";
                  const shortDesc =
                    rawDesc.length > 60 ? rawDesc.slice(0, 60).trim() + "…" : rawDesc || null;

                  return (
                    <Link
                      href={`/product/${(product.slug && String(product.slug).trim()) ? product.slug : product.id}`}
                      key={product.id}
                      scroll={false}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                        }
                      }}
                      className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Зображення 3:4 */}
                      <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden">
                        {product.first_media?.type === "video" ? (
                          <video
                            src={`/api/images/${product.first_media.url}`}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                            loop
                            muted
                            playsInline
                            autoPlay
                            preload="none"
                          />
                        ) : (
                          <Image
                            src={getProductImageSrc(product.first_media)}
                            alt={`${product.name} — ${SITE_STORE_NAME}`}
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
                            loading={index < 9 ? "eager" : "lazy"}
                            priority={index < 3}
                            quality={index < 9 ? 85 : 75}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          />
                        )}
                        {/* Бейдж знижки */}
                        {product.discount_percentage && (
                          <span className="absolute top-2 left-2 text-[10px] font-semibold font-['Montserrat'] text-amber-800/95 bg-amber-100/90 px-1.5 py-0.5 rounded">
                            −{product.discount_percentage}%
                          </span>
                        )}
                      </div>

                      {/* Інфо */}
                      <div className="p-4 flex flex-col gap-1 flex-1">
                        <h3 className="font-['Montserrat'] font-light text-lg sm:text-xl md:text-2xl leading-tight tracking-[-0.02em] text-[#3D1A00] break-words line-clamp-2">
                          {product.name}
                        </h3>
                        {shortDesc && (
                          <p className="font-['Montserrat'] font-light text-[11px] leading-[194%] tracking-[-0.02em] text-[#3D1A00] align-middle line-clamp-2">
                            {shortDesc}
                          </p>
                        )}
                        {(product.package_weight || product.course) && (
                          <div className="font-['Montserrat'] text-[10px] sm:text-[11px] leading-snug text-[#3D1A00]/75 space-y-0.5">
                            {product.package_weight ? (
                              <p>
                                <span className="font-semibold text-[#3D1A00]/90">
                                  {LABEL_PRODUCT_PACKAGE}:
                                </span>{" "}
                                {product.package_weight}
                              </p>
                            ) : null}
                            {product.course ? (
                              <p>
                                <span className="font-semibold text-[#3D1A00]/90">
                                  {LABEL_PRODUCT_COURSE}:
                                </span>{" "}
                                {product.course}
                              </p>
                            ) : null}
                          </div>
                        )}
                        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                          <div className="flex flex-col leading-none space-y-0.5">
                            {product.discount_percentage && (
                              <span className="font-['Montserrat'] font-normal text-sm sm:text-base lg:text-xl leading-none tracking-[-0.02em] text-[#3D1A00]/70 line-through">
                                {product.price.toLocaleString("uk-UA")} грн
                              </span>
                            )}
                            <span className="font-['Montserrat'] font-normal text-lg sm:text-xl lg:text-3xl leading-none tracking-[-0.02em] text-[#3D1A00] align-middle">
                              {displayPrice.toLocaleString("uk-UA")} грн
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={outOfStock}
                            onClick={outOfStock ? undefined : (e) => handleAddToCart(e, product)}
                            className={`py-2 px-4 text-xs sm:text-sm font-semibold font-['Montserrat'] rounded-full transition-colors whitespace-nowrap ${
                              outOfStock
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-[#8B9A47] hover:bg-[#7a8940] text-white"
                            }`}
                          >
                            {outOfStock ? "Немає в наявності" : "В кошик"}
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Пагінація / показати ще */}
            {visibleCount < sortedProducts.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="px-8 py-3 bg-[#3D1A00] text-white font-semibold font-['Montserrat'] uppercase tracking-wider hover:bg-[#3D1A00]/90 transition-colors rounded-lg min-h-[44px]"
                >
                  Показати ще
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SidebarMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}