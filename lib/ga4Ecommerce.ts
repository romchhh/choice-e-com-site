export const GA4_CURRENCY = "UAH";
export const GA4_BRAND = "Choice";
export const GA4_VERTICAL = "retail";

type GA4EcommerceItem = Record<string, unknown>;

type GA4EcommercePayload = {
  currency?: string;
  value?: number;
  transaction_id?: string;
  items: GA4EcommerceItem[];
};

function getDataLayer(): unknown[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  return w.dataLayer;
}

export function pushGA4EcommerceEvent(eventName: string, ecommerce: GA4EcommercePayload) {
  if (typeof window === "undefined") return;
  const dataLayer = getDataLayer();
  // Ensure previous ecommerce payload is not reused by accident
  dataLayer.push({ ecommerce: null });
  dataLayer.push({ event: eventName, ecommerce });
}

