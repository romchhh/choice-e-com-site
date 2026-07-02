/**
 * Shared pricing helpers to avoid duplicated discount/subtotal logic.
 */

export type ProductPricingFields = {
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
};

export type NormalizedProductPricing = {
  price: number;
  old_price: number | null;
  discount_percentage: number | null;
};

export type ProductPriceDisplay = {
  displayPrice: number;
  strikePrice: number | null;
  discountBadgePct: number | null;
};

export function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isValidDiscountPercentage(
  value: number | null | undefined
): value is number {
  return value != null && value > 0 && value <= 100;
}

/**
 * Normalizes product pricing before save and when reading stale DB rows.
 * - Drops invalid / zero / negative discount %
 * - Clears stale old_price when it no longer represents a sale
 * - Uses a single discount mode: either % or old_price, not both
 */
export function normalizeProductPricing(
  price: number,
  oldPrice?: number | null,
  discountPercentage?: number | null
): NormalizedProductPricing {
  const normalizedPrice = Math.max(0, Number(price) || 0);
  let normalizedOldPrice = parseOptionalNumber(oldPrice);
  let normalizedDiscount = parseOptionalNumber(discountPercentage);

  if (!isValidDiscountPercentage(normalizedDiscount)) {
    normalizedDiscount = null;
  } else {
    normalizedDiscount = Math.round(normalizedDiscount);
    normalizedOldPrice = null;
  }

  if (
    normalizedOldPrice != null &&
    normalizedOldPrice <= normalizedPrice
  ) {
    normalizedOldPrice = null;
  }

  return {
    price: normalizedPrice,
    old_price: normalizedOldPrice,
    discount_percentage: normalizedDiscount,
  };
}

/**
 * Returns price after applying discount percentage.
 * @param price - Original price
 * @param discountPercentage - Optional discount (0–100). If undefined/0/negative, returns price.
 */
export function getDiscountedPrice(
  price: number,
  discountPercentage?: number | null
): number {
  if (!isValidDiscountPercentage(discountPercentage)) return price;
  return price * (1 - discountPercentage / 100);
}

/**
 * Returns subtotal for an item: (price after discount) * quantity.
 */
export function getItemSubtotal(
  price: number,
  quantity: number,
  discountPercentage?: number | null
): number {
  return getDiscountedPrice(price, discountPercentage) * quantity;
}

/** Storefront display: sale price, crossed-out price, optional badge %. */
export function getProductPriceDisplay(
  product: ProductPricingFields
): ProductPriceDisplay {
  const { price, old_price, discount_percentage } = normalizeProductPricing(
    product.price,
    product.old_price,
    product.discount_percentage
  );

  if (isValidDiscountPercentage(discount_percentage)) {
    return {
      displayPrice: Math.round(getDiscountedPrice(price, discount_percentage)),
      strikePrice: price,
      discountBadgePct: discount_percentage,
    };
  }

  if (old_price != null && old_price > price) {
    const pct = Math.round((1 - price / old_price) * 100);
    return {
      displayPrice: price,
      strikePrice: old_price,
      discountBadgePct: pct > 0 ? pct : null,
    };
  }

  return {
    displayPrice: price,
    strikePrice: null,
    discountBadgePct: null,
  };
}
