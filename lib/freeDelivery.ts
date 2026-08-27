/** Поріг безкоштовної доставки (грн) — узгоджено з комунікацією в шапці. */
export const FREE_DELIVERY_THRESHOLD_UAH = 2000;

export function getFreeDeliveryRemaining(cartTotalUah: number): number {
  const total = Math.max(0, Math.round(cartTotalUah));
  return Math.max(0, FREE_DELIVERY_THRESHOLD_UAH - total);
}

export function getFreeDeliveryProgress(cartTotalUah: number): number {
  const total = Math.max(0, cartTotalUah);
  return Math.min(100, Math.round((total / FREE_DELIVERY_THRESHOLD_UAH) * 100));
}

export function hasUnlockedFreeDelivery(cartTotalUah: number): boolean {
  return getFreeDeliveryRemaining(cartTotalUah) <= 0;
}
