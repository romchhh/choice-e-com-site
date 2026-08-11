"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/i18n/paths";

interface MainContentProps {
  children: React.ReactNode;
  id?: string;
}

export default function MainContent({ children, id }: MainContentProps) {
  const pathname = usePathname();
  const [isHomePage, setIsHomePage] = useState(
    () => stripLocalePrefix(pathname || "/") === "/"
  );

  useEffect(() => {
    // / and /ru are both home — pathname may keep /ru or be rewritten to /
    setIsHomePage(stripLocalePrefix(pathname || "/") === "/");
  }, [pathname]);

  // Вимикаємо нативне відновлення скролу та завжди прокручуємо догори при зміні роуту
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <main
      id={id}
      className={`bg-[var(--background-warm-yellow)] ${
        isHomePage ? "" : "mt-[var(--site-header-offset)]"
      }`}
    >
      {children}
    </main>
  );
}
