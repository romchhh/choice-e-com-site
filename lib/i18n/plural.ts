import type { Dictionary } from "./dictionaries";

/** Ukrainian / Russian plural for «товар». */
export function catalogProductWord(count: number, dict: Dictionary): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return dict.catalog.productMany;
  if (n1 === 1) return dict.catalog.productOne;
  if (n1 >= 2 && n1 <= 4) return dict.catalog.productFew;
  return dict.catalog.productMany;
}
