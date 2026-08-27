export type SearchableProduct = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  top_sale?: boolean;
  priority?: number;
  first_media?: { type: string; url: string } | null;
  description?: string | null;
};

export type SearchSort =
  | "relevance"
  | "popular"
  | "price_asc"
  | "price_desc"
  | "name";

function scoreProduct(product: SearchableProduct, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const name = String(product.name || "").toLowerCase();
  const desc = String(product.description || "").toLowerCase();
  let score = 0;
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 80;
  else if (name.includes(q)) score += 50;
  if (desc.includes(q)) score += 10;
  if (product.top_sale) score += 5;
  score += Math.min(10, Number(product.priority) || 0);
  return score;
}

export function filterProductsByQuery<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const name = String(p.name || "").toLowerCase();
    const desc = String(p.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q);
  });
}

export function sortSearchProducts<T extends SearchableProduct>(
  products: T[],
  query: string,
  sort: SearchSort
): T[] {
  const list = [...products];
  switch (sort) {
    case "price_asc":
      return list.sort((a, b) => a.price - b.price);
    case "price_desc":
      return list.sort((a, b) => b.price - a.price);
    case "name":
      return list.sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "uk")
      );
    case "popular":
      return list.sort((a, b) => {
        const ap = (a.top_sale ? 1000 : 0) + (Number(a.priority) || 0);
        const bp = (b.top_sale ? 1000 : 0) + (Number(b.priority) || 0);
        if (bp !== ap) return bp - ap;
        return b.id - a.id;
      });
    case "relevance":
    default:
      return list.sort(
        (a, b) => scoreProduct(b, query) - scoreProduct(a, query)
      );
  }
}
