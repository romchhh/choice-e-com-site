"use client";

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useCategories } from "@/lib/CategoriesProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LocaleLink from "@/components/i18n/LocaleLink";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";
import CallbackRequestModal from "./CallbackRequestModal";
import { SITE_WORDMARK } from "@/lib/siteBrand";
import { siteContact } from "@/lib/siteContact";
import { localizedLabel } from "@/lib/i18n/localizeCatalog";
import { stripLocalePrefix } from "@/lib/i18n/paths";

const ICON_FILTER_DARK =
  "brightness(0) saturate(100%) invert(14%) sepia(99%) saturate(2044%) hue-rotate(11deg) brightness(95%) contrast(101%)";

const ICON_FILTER_LIGHT = "brightness(0) invert(1)";

const NAV_LINK_CLASS =
  "relative z-10 inline-block cursor-pointer whitespace-nowrap text-xs font-bold font-['Montserrat'] px-3 py-1.5 rounded-full text-[#3D1A00] transition-colors duration-200 hover:bg-[#3D1A00] hover:text-white";

interface Subcategory {
  id: number;
  name: string;
  name_ru?: string | null;
}

/** Затримка перед закриттям меню категорій — щоб встигнути перевести курсор на fixed-панель після виходу з пункту. */
const NAV_MENU_LEAVE_DELAY_MS = 280;

export default function Header() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isBasketOpen,
    setIsBasketOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useAppContext();

  const pathname = usePathname();
  const { dict, locale } = useLocale();
  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Use categories from context instead of fetching
  const { categories } = useCategories();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null
  );
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const infoTimeout = useRef<NodeJS.Timeout | null>(null);

  const [pinnedCatalog, setPinnedCatalog] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const cancelCatalogMenuClose = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  /** Один таймер на все меню каталогу: header / категорія / панель — інакше залишаються «сирі» таймери й null прилітає вже коли курсор знову на категорії (mouseEnter не повторюється). */
  const scheduleCatalogMenuClose = () => {
    if (pinnedCatalog) return;
    cancelCatalogMenuClose();
    hoverTimeout.current = setTimeout(() => {
      setHoveredCategoryId(null);
      hoverTimeout.current = null;
    }, NAV_MENU_LEAVE_DELAY_MS);
  };
  const categoryRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const infoRef = useRef<HTMLSpanElement | null>(null);
  const [categoryLeftPositions, setCategoryLeftPositions] = useState<Map<number, number>>(new Map());
  const [infoLeftPosition, setInfoLeftPosition] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [onHero, setOnHero] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  const isHomePage = stripLocalePrefix(pathname || "/") === "/";
  const overlayOpen =
    isSidebarOpen || isBasketOpen || isSearchOpen || callbackOpen;
  const mobileHeroTransparent = isHomePage && onHero && !overlayOpen;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeaderOffset = () => {
      document.documentElement.style.setProperty(
        "--site-header-offset",
        `${el.offsetHeight}px`
      );
    };

    syncHeaderOffset();
    const observer = new ResizeObserver(syncHeaderOffset);
    observer.observe(el);
    window.addEventListener("resize", syncHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncHeaderOffset);
    };
  }, [pathname, locale]);

  useEffect(() => {
    const updateScrollState = () => {
      const y = window.scrollY;
      setIsScrolled(y > 12);
      setOnHero(isHomePage && y < 6);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isHomePage, pathname]);

  // Скидаємо стан хедера при зміні мови/шляху — інакше «нашарування» після UA↔RU
  useEffect(() => {
    setIsScrolled(window.scrollY > 12);
    setOnHero(
      stripLocalePrefix(pathname || "/") === "/" && window.scrollY < 6
    );
    setHoveredCategoryId(null);
    setInfoMenuOpen(false);
    setPinnedCatalog(false);
    cancelCatalogMenuClose();
  }, [pathname, locale]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pinnedCatalog &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setPinnedCatalog(false);
        setHoveredCategoryId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedCatalog]);

  useEffect(() => {
    return () => {
      if (infoTimeout.current) clearTimeout(infoTimeout.current);
    };
  }, []);

  // Categories are now loaded from context, no need to fetch

  useEffect(() => {
    if (hoveredCategoryId === null) {
      setSubcategories([]);
      setSubcategoriesLoading(false);
      return;
    }

    const categoryId = hoveredCategoryId;
    setSubcategories([]);
    setSubcategoriesLoading(true);
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        const data = await res.json();
        if (cancelled) return;
        setSubcategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load subcategories", err);
        if (!cancelled) setSubcategories([]);
      } finally {
        if (!cancelled) setSubcategoriesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hoveredCategoryId]);

  // Calculate positions for dropdown alignment
  useEffect(() => {
    const updatePositions = () => {
      // Find the header container
      const headerContainer = document.querySelector('.max-w-\\[1920px\\]');
      if (!headerContainer) return;
      
      const containerRect = headerContainer.getBoundingClientRect();
      const containerPadding = 40; // px-10 = 40px

      // Update category positions
      const newPositions = new Map<number, number>();
      categoryRefs.current.forEach((element, categoryId) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const leftOffset = rect.left - containerRect.left - containerPadding;
          newPositions.set(categoryId, Math.max(0, leftOffset));
        }
      });
      setCategoryLeftPositions(newPositions);

      // Update info position
      if (infoRef.current) {
        const rect = infoRef.current.getBoundingClientRect();
        const leftOffset = rect.left - containerRect.left - containerPadding;
        setInfoLeftPosition(Math.max(0, leftOffset));
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePositions);
    };
  }, [categories, hoveredCategoryId, infoMenuOpen]);


  return (
    <>
      {/*
        While an overlay locks body scroll, sticky stops working and the header
        scrolls away with the page — so keep it fixed for the overlay lifetime.
      */}
      {overlayOpen ? (
        <div
          className="pointer-events-none w-full shrink-0"
          style={{ height: "var(--site-header-offset)" }}
          aria-hidden
        />
      ) : null}
      <div
        className={`${
          overlayOpen ? "fixed inset-x-0 top-0" : "sticky top-0"
        } z-50 w-full transition-all duration-300 ${
          mobileHeroTransparent
            ? "max-lg:border-b max-lg:border-transparent max-lg:bg-transparent max-lg:shadow-none lg:border-b lg:border-[#3D1A00]/20 lg:bg-[#FFF9F0]"
            : "border-b border-[#3D1A00]/20 bg-[#FFF9F0]"
        } ${
          mobileHeroTransparent
            ? "lg:shadow-[0_2px_10px_rgba(61,26,0,0.06)]"
            : isScrolled
              ? "shadow-[0_8px_24px_rgba(61,26,0,0.12)]"
              : "shadow-[0_2px_10px_rgba(61,26,0,0.06)]"
        }`}
      >
      <header
        ref={headerRef}
        className="mx-auto w-full max-w-[1920px] text-[#3D1A00]"
        onMouseEnter={() => {
          cancelCatalogMenuClose();
        }}
        onMouseLeave={() => {
          scheduleCatalogMenuClose();
        }}
      >
        {/* === WRAPPER: everything inside shares same bg and styles === */}
        <div className="w-full">
          {/* Top info bar — desktop */}
          <div className="hidden lg:flex justify-center bg-[#D7D799]">
            <div className="w-full max-w-[1920px] mx-auto px-10 flex justify-between items-center h-12 text-xs font-['Montserrat'] font-medium text-[#3D1A00] border-b border-[#3D1A00]/15">
              <div className="flex min-w-0 items-center gap-3 xl:gap-4">
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-300/80 bg-white/70 px-3 py-1 font-medium tracking-wide text-neutral-700"
                  title={dict.brand.freeDelivery}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="opacity-80"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                  <span className="whitespace-nowrap">{dict.brand.freeDelivery}</span>
                </span>
                <span className="hidden xl:inline shrink-0 text-[#3D1A00]/75">
                  {siteContact.scheduleLines[0]}
                </span>
              </div>
              <div className="flex items-center gap-3 xl:gap-4 shrink-0">
                <a
                  href={`tel:${siteContact.phoneTel}`}
                  className="font-semibold text-[#3D1A00] hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  {siteContact.phoneDisplay}
                </a>
                <button
                  type="button"
                  onClick={() => setCallbackOpen(true)}
                  className="h-8 rounded-full bg-[#3D1A00] px-4 font-['Montserrat'] text-xs font-semibold text-[#FFF9F0] whitespace-nowrap transition-colors hover:bg-[#3D1A00]/85"
                >
                  {dict.callback.widgetLabel}
                </button>
                <Suspense fallback={null}>
                  <LanguageSwitcher />
                </Suspense>
                <LocaleLink href="/contacts" className="hover:opacity-80 transition-colors">{dict.nav.contacts}</LocaleLink>
                <a href={siteContact.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">Instagram</a>
                <a href={siteContact.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-colors">Telegram</a>
              </div>
            </div>
          </div>
          {/* Top info bar — mobile (один рядок) */}
          <div
            className={`lg:hidden border-b ${
              mobileHeroTransparent
                ? "max-lg:border-transparent max-lg:bg-transparent"
                : "border-[#3D1A00]/15 bg-[#D7D799]"
            }`}
          >
            <div
              className={`mx-auto flex h-9 max-w-[1920px] items-center justify-between gap-2 px-3 text-[10px] font-['Montserrat'] font-medium sm:px-4 sm:text-xs ${
                mobileHeroTransparent ? "max-lg:text-white/95" : "text-[#3D1A00]"
              }`}
            >
              <span
                className="flex min-w-0 items-center gap-1.5 truncate"
                title={dict.brand.freeDelivery}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 opacity-80"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
                <span className="truncate">{dict.brand.freeDeliveryShort}</span>
              </span>
              <a
                href={`tel:${siteContact.phoneTel}`}
                className="shrink-0 font-semibold whitespace-nowrap hover:opacity-80"
              >
                {siteContact.phoneDisplay}
              </a>
              <button
                type="button"
                onClick={() => setCallbackOpen(true)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap transition-colors sm:px-3 sm:text-xs ${
                  mobileHeroTransparent
                    ? "bg-white/90 text-[#3D1A00] hover:bg-white"
                    : "bg-[#3D1A00] text-[#FFF9F0] hover:bg-[#3D1A00]/85"
                }`}
              >
                {dict.callback.headerCta}
              </button>
              <Suspense fallback={null}>
                <LanguageSwitcher className="shrink-0 text-[10px] sm:text-xs" />
              </Suspense>
            </div>
          </div>
          {/* Top nav */}
          <div className="hidden lg:flex justify-center bg-[#FFF9F0] border-b border-[#3D1A00]/10">
            <div className="w-full max-w-[1920px] mx-auto flex justify-between items-stretch h-20 px-10">
            <LocaleLink href="/" className="flex items-center self-center pt-1 group shrink-0">
              <span
                className="font-['Montserrat'] font-semibold text-[1.75rem] lg:text-[2.2rem] leading-none tracking-[0.14em] text-[#3D1A00] transition-opacity duration-300 group-hover:opacity-80"
              >
                {SITE_WORDMARK}
              </span>
            </LocaleLink>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 text-xs font-bold font-['Montserrat'] min-w-0">
              {/* Product Categories — hover лише на тексті посилання, не на всю висоту рядка (items-stretch давав «раннє» відкриття). */}
              {Array.isArray(categories) && categories.map((category) => (
                <div
                  key={category.id}
                  ref={(el) => {
                    if (el) {
                      categoryRefs.current.set(category.id, el);
                    } else {
                      categoryRefs.current.delete(category.id);
                    }
                  }}
                  className="relative group flex items-center self-center min-h-0"
                >
                  <LocaleLink
                    href={`/catalog?categoryId=${category.id}`}
                    onMouseEnter={() => {
                      cancelCatalogMenuClose();
                      setHoveredCategoryId(category.id);
                    }}
                    onMouseLeave={() => {
                      scheduleCatalogMenuClose();
                    }}
                    className={NAV_LINK_CLASS}
                  >
                    {localizedLabel(category, locale)}
                  </LocaleLink>

                  {/* Subcategories dropdown */}
                  {hoveredCategoryId === category.id && (
                      <div
                        className="fixed top-[var(--site-header-offset)] left-0 w-full bg-white shadow-md px-4 py-4 z-50 transition-opacity duration-200 opacity-100 pointer-events-auto border-b border-[#3D1A00]/10"
                        onMouseEnter={() => {
                          cancelCatalogMenuClose();
                        }}
                        onMouseLeave={() => {
                          scheduleCatalogMenuClose();
                        }}
                      >
                        <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${categoryLeftPositions.get(category.id) || 0}px` }}>
                        {subcategoriesLoading ? (
                          <p className="text-gray-500 text-xs py-2 font-['Montserrat']">
                            {dict.common.loading}
                          </p>
                        ) : (
                          <>
                            {subcategories.map((subcat) => (
                              <LocaleLink
                                key={subcat.id}
                                href={`/catalog?subcategory=${encodeURIComponent(
                                  subcat.name
                                )}`}
                                className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                              >
                                {localizedLabel(subcat, locale)}
                              </LocaleLink>
                            ))}
                            <LocaleLink
                              href={`/catalog?categoryId=${category.id}`}
                              className={`text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200 underline ${subcategories.length > 0 ? "mt-2" : ""}`}
                            >
                              {dict.nav.allProducts}
                            </LocaleLink>
                          </>
                        )}
                        </div>
                      </div>
                    )}
                </div>
              ))}

              {/* Information dropdown */}
              <div className="relative flex items-center self-center min-h-0">
                <span
                  ref={infoRef}
                  onMouseEnter={() => {
                    if (infoTimeout.current) clearTimeout(infoTimeout.current);
                    setInfoMenuOpen(true);
                  }}
                  onMouseLeave={() => {
                    infoTimeout.current = setTimeout(() => {
                      setInfoMenuOpen(false);
                    }, NAV_MENU_LEAVE_DELAY_MS);
                  }}
                  className={`${NAV_LINK_CLASS} cursor-default ${
                    infoMenuOpen ? "bg-[#3D1A00] text-white" : ""
                  }`}
                >
                  {dict.nav.info}
                </span>

                <div
                  className={`fixed top-[var(--site-header-offset)] left-0 w-full bg-white shadow-md px-4 py-2 z-50 border-b border-[#3D1A00]/10 transition-opacity duration-200 ${
                    infoMenuOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onMouseEnter={() => {
                    if (infoTimeout.current) clearTimeout(infoTimeout.current);
                  }}
                  onMouseLeave={() => {
                    infoTimeout.current = setTimeout(() => {
                      setInfoMenuOpen(false);
                    }, NAV_MENU_LEAVE_DELAY_MS);
                  }}
                >
                  <div className="max-w-[1920px] mx-auto w-full flex flex-col gap-1" style={{ paddingLeft: `${infoLeftPosition}px` }}>
                    <LocaleLink
                      href="/info#about"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.aboutBrand}
                    </LocaleLink>
                    <LocaleLink
                      href="/partnership"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.partnership}
                    </LocaleLink>
                    <LocaleLink
                      href="/delivery-and-payment"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.deliveryPayment}
                    </LocaleLink>
                    <LocaleLink
                      href="/returns-and-exchange"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.returnsExchange}
                    </LocaleLink>
                    <LocaleLink
                      href="/info#faq"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.faq}
                    </LocaleLink>
                    <LocaleLink
                      href="/contacts"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.contacts}
                    </LocaleLink>
                    <LocaleLink
                      href="/catalog?promo=1"
                      className="text-gray-600 hover:text-[#3D1A00] text-xs py-2 font-bold font-['Montserrat'] transition-colors duration-200"
                    >
                      {dict.nav.promo}
                    </LocaleLink>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label={dict.nav.search}
                className="cursor-pointer relative flex h-12 w-12 shrink-0 items-center justify-center transition-opacity hover:opacity-80"
              >
                <Image
                  className="h-7 w-7"
                  height="28"
                  width="28"
                  alt=""
                  src="/images/dark-theme/search.svg"
                  style={{ filter: ICON_FILTER_DARK }}
                />
              </button>

              <button
                className="cursor-pointer relative flex h-12 w-12 shrink-0 items-center justify-center"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  className="h-7 w-7"
                  height="28"
                  width="28"
                  alt="shopping basket"
                  src="/images/light-theme/cart.svg"
                  style={{ filter: ICON_FILTER_DARK }}
                />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-white text-sm font-['Montserrat'] font-bold bg-[#3D1A00] rounded-full leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div
          className={`relative flex h-14 items-center justify-between gap-2 px-3 lg:hidden sm:px-4 ${
            mobileHeroTransparent
              ? "max-lg:border-t max-lg:border-transparent max-lg:bg-transparent"
              : "border-t border-[#3D1A00]/10 bg-[#FFF9F0]"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setIsBasketOpen(false);
              setIsSearchOpen(false);
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors ${
              mobileHeroTransparent
                ? "max-lg:text-white max-lg:hover:bg-white/15"
                : "text-[#3D1A00] hover:bg-[#3D1A00]/5"
            }`}
            aria-label={isSidebarOpen ? dict.common.close : dict.nav.menu}
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? (
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          <LocaleLink
            href="/"
            className="absolute left-1/2 -translate-x-1/2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span
              className={`font-['Montserrat'] text-[1.25rem] font-semibold leading-none tracking-[0.12em] sm:text-[1.4rem] ${
                mobileHeroTransparent
                  ? "max-lg:text-white max-lg:drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
                  : "text-[#3D1A00]"
              }`}
            >
              {SITE_WORDMARK}
            </span>
          </LocaleLink>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsSearchOpen(true);
              }}
              aria-label={dict.nav.search}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                mobileHeroTransparent
                  ? "max-lg:hover:bg-white/15"
                  : "hover:bg-[#3D1A00]/5"
              }`}
            >
              <Image
                height="20"
                width="20"
                alt=""
                src="/images/dark-theme/search.svg"
                className="h-5 w-5"
                style={{
                  filter: mobileHeroTransparent ? ICON_FILTER_LIGHT : ICON_FILTER_DARK,
                }}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsBasketOpen(!isBasketOpen);
              }}
              aria-label={dict.basket.title}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                mobileHeroTransparent
                  ? "max-lg:hover:bg-white/15"
                  : "hover:bg-[#3D1A00]/5"
              }`}
            >
              <Image
                height="22"
                width="22"
                alt=""
                src="/images/light-theme/cart.svg"
                className="h-[22px] w-[22px]"
                style={{
                  filter: mobileHeroTransparent ? ICON_FILTER_LIGHT : ICON_FILTER_DARK,
                }}
              />
              {totalItems > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#3D1A00] px-0.5 text-[10px] font-bold leading-none text-white font-['Montserrat']">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      </div>

      <SidebarMenu
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onRequestCallback={() => setCallbackOpen(true)}
      />

      <SidebarBasket
        isOpen={isBasketOpen}
        setIsOpen={setIsBasketOpen}
      />
      <SidebarSearch
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />

      <CallbackRequestModal
        open={callbackOpen}
        onClose={() => setCallbackOpen(false)}
      />

      {/* Floating callback widget */}
      <button
        type="button"
        onClick={() => setCallbackOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex h-12 items-center gap-2 rounded-full border border-[#3D1A00]/10 bg-[#D7D799] px-4 text-[#3D1A00] shadow-[0_8px_24px_rgba(61,26,0,0.18)] transition-all hover:bg-[#cfd48a] sm:bottom-8 sm:right-8 sm:h-14 sm:px-5"
        aria-label={dict.callback.widgetLabel}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.528-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
          />
        </svg>
        <span className="hidden font-['Montserrat'] text-sm font-semibold sm:inline">
          {dict.callback.fabLabel}
        </span>
      </button>
    </>
  );
}
