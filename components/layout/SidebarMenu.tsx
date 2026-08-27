"use client";

import { Suspense } from "react";
import LocaleLink from "@/components/i18n/LocaleLink";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useCategories } from "@/lib/CategoriesProvider";
import { localizedLabel } from "@/lib/i18n/localizeCatalog";
import { siteContact } from "@/lib/siteContact";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRequestCallback?: () => void;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
  onRequestCallback,
}: SidebarMenuProps) {
  const { dict, locale } = useLocale();
  const {
    categories,
    subcategories: subcategoriesMap,
    loading,
    error,
    fetchSubcategoriesForCategory,
  } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const selectedSubcategories = selectedCategoryId
    ? subcategoriesMap.get(selectedCategoryId) || []
    : [];

  const handleCategorySelect = async (categoryId: number) => {
    setSelectedCategoryId(categoryId);

    if (!subcategoriesMap.has(categoryId)) {
      setLoadingSubcategories(true);
      await fetchSubcategoriesForCategory(categoryId);
      setLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      void handleCategorySelect(categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, selectedCategoryId]);

  useBodyScrollLock(isOpen);

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const close = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/45 backdrop-blur-[1px] lg:hidden"
          style={{ top: "var(--site-header-offset)" }}
          onClick={close}
          aria-hidden
        />
      )}

      <div
        className={`fixed left-0 z-[46] flex w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        style={{
          top: "var(--site-header-offset)",
          height: "calc(100dvh - var(--site-header-offset))",
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        aria-label={dict.nav.menu}
      >
        <div className="shrink-0 border-b border-[#3D1A00]/10 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max flex-row gap-3 px-4 py-4">
              {!mounted || loading ? (
                <div className="px-4 py-2 text-sm text-[#3D1A00]/60 font-['Montserrat']">
                  {dict.common.loading}
                </div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500 font-['Montserrat']">
                  {dict.common.error}
                </div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => void handleCategorySelect(cat.id)}
                    className={`whitespace-nowrap rounded-full px-5 py-3 text-base font-semibold transition-all duration-200 font-['Montserrat'] ${
                      selectedCategoryId === cat.id
                        ? "bg-[#3D1A00] text-white"
                        : "bg-[#3D1A00]/10 text-[#3D1A00] hover:bg-[#3D1A00]/20"
                    }`}
                  >
                    {localizedLabel(cat, locale)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          {selectedCategory && (
            <div className="px-4 pt-4 pb-2">
              {loadingSubcategories ? (
                <div className="py-3 text-center text-sm text-[#3D1A00]/60 font-['Montserrat']">
                  {dict.common.loading}
                </div>
              ) : selectedSubcategories.length > 0 ? (
                <>
                  <div className="space-y-0.5">
                    {selectedSubcategories.map((sub) => (
                      <LocaleLink
                        key={sub.id}
                        href={`/catalog?subcategory=${encodeURIComponent(sub.name)}`}
                        className="block border-b border-[#3D1A00]/5 py-3 text-[15px] text-[#3D1A00] transition-colors hover:text-[#3D1A00]/70 font-['Montserrat']"
                        onClick={close}
                      >
                        {localizedLabel(sub, locale)}
                      </LocaleLink>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-[#3D1A00]/10 pt-3">
                    <LocaleLink
                      href={`/catalog?categoryId=${selectedCategory.id}`}
                      className="text-[15px] font-medium text-[#8B9A47] transition-colors hover:opacity-80 font-['Montserrat']"
                      onClick={close}
                    >
                      {dict.nav.allProducts}
                    </LocaleLink>
                  </div>
                </>
              ) : (
                <LocaleLink
                  href={`/catalog?categoryId=${selectedCategory.id}`}
                  className="block py-2 text-[15px] font-medium text-[#8B9A47] font-['Montserrat']"
                  onClick={close}
                >
                  {dict.nav.allProducts}
                </LocaleLink>
              )}
            </div>
          )}

          <div className="px-4 py-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D1A00]/55 font-['Montserrat']">
              {dict.nav.info}
            </h3>
            <nav className="space-y-0.5">
              {[
                { href: "/info#about", label: dict.nav.aboutBrand },
                { href: "/partnership", label: dict.nav.partnership },
                { href: "/delivery-and-payment", label: dict.nav.deliveryPayment },
                { href: "/returns-and-exchange", label: dict.nav.returnsExchange },
                { href: "/info#faq", label: dict.nav.faq },
                { href: "/contacts", label: dict.nav.contacts },
                { href: "/catalog?promo=1", label: dict.nav.promo },
              ].map((item) => (
                <LocaleLink
                  key={item.href}
                  href={item.href}
                  className="block py-2.5 text-[15px] text-[#3D1A00] transition-colors hover:text-[#3D1A00]/70 font-['Montserrat']"
                  onClick={close}
                >
                  {item.label}
                </LocaleLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#3D1A00]/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <a
              href={`tel:${siteContact.phoneTel}`}
              className="inline-flex h-10 items-center rounded-full bg-[#3D1A00] px-4 text-sm font-semibold text-white font-['Montserrat']"
            >
              {siteContact.phoneDisplay}
            </a>
            {onRequestCallback ? (
              <button
                type="button"
                onClick={() => {
                  close();
                  onRequestCallback();
                }}
                className="inline-flex h-10 items-center rounded-full border border-[#3D1A00]/20 bg-white px-4 text-sm font-semibold text-[#3D1A00] font-['Montserrat']"
              >
                {dict.callback.widgetLabel}
              </button>
            ) : null}
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
            <div className="flex items-center gap-3">
              <a
                href={siteContact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3D1A00]/80 transition-opacity hover:opacity-70"
                aria-label="Instagram"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt=""
                  width={22}
                  height={22}
                />
              </a>
              <a
                href={siteContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3D1A00]/80 transition-opacity hover:opacity-70"
                aria-label="Telegram"
              >
                <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
