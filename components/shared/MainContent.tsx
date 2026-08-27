"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface MainContentProps {
  children: React.ReactNode;
  id?: string;
}

export default function MainContent({ children, id }: MainContentProps) {
  const pathname = usePathname();

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
    <main id={id} className="bg-[var(--background-warm-yellow)]">
      {children}
    </main>
  );
}
