export type CompositionItem = {
  name: string;
  description: string;
};

export function normalizeCompositionItems(raw: unknown): CompositionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = String((item as { name?: unknown }).name ?? "").trim();
      const description = String(
        (item as { description?: unknown }).description ?? ""
      ).trim();
      if (!name && !description) return null;
      return { name: name || "—", description };
    })
    .filter((item): item is CompositionItem => item != null);
}

export function compositionItemsToPlainText(items: CompositionItem[]): string {
  return items
    .map((item) =>
      item.description ? `${item.name}\n${item.description}` : item.name
    )
    .join("\n\n")
    .trim();
}

export function emptyCompositionItem(): CompositionItem {
  return { name: "", description: "" };
}
