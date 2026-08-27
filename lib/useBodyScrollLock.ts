"use client";

import { useEffect } from "react";

let lockCount = 0;

const saved = {
  bodyOverflow: "",
  bodyPaddingRight: "",
  htmlOverflow: "",
};

function applyLock() {
  if (typeof document === "undefined") return;

  saved.bodyOverflow = document.body.style.overflow;
  saved.bodyPaddingRight = document.body.style.paddingRight;
  saved.htmlOverflow = document.documentElement.style.overflow;

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function releaseLock() {
  if (typeof document === "undefined") return;

  document.body.style.overflow = saved.bodyOverflow;
  document.body.style.paddingRight = saved.bodyPaddingRight;
  document.documentElement.style.overflow = saved.htmlOverflow;
}

/** Reference-counted body scroll lock (safe when several overlays are open). */
export function lockBodyScroll(): () => void {
  lockCount += 1;
  if (lockCount === 1) {
    applyLock();
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      releaseLock();
    }
  };
}

/** Lock page scroll while `locked` is true. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    return lockBodyScroll();
  }, [locked]);
}
