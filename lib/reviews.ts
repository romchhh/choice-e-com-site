/**
 * Client-safe review types and helpers (no Prisma / Node deps).
 */

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewSource = "customer" | "admin";

export type ReviewDTO = {
  id: number;
  author_name: string;
  author_email: string | null;
  text: string;
  rating: number;
  photo_url: string | null;
  product_id: number | null;
  product_name: string | null;
  product_slug: string | null;
  order_id: number | null;
  status: ReviewStatus;
  source: ReviewSource;
  show_on_home: boolean;
  created_at: string;
  moderated_at: string | null;
};

export function clampRating(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export function resolveReviewPhotoSrc(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `/api/images/${trimmed}`;
}

export function mapPrismaReview(row: {
  id: number;
  authorName: string;
  authorEmail: string | null;
  text: string;
  rating: number;
  photoUrl: string | null;
  productId: number | null;
  orderId: number | null;
  status: string;
  source: string;
  showOnHome: boolean;
  createdAt: Date;
  moderatedAt: Date | null;
  product?: { id: number; name: string; slug: string | null } | null;
}): ReviewDTO {
  return {
    id: row.id,
    author_name: row.authorName,
    author_email: row.authorEmail,
    text: row.text,
    rating: row.rating,
    photo_url: row.photoUrl,
    product_id: row.productId,
    product_name: row.product?.name ?? null,
    product_slug: row.product?.slug ?? null,
    order_id: row.orderId,
    status: (row.status as ReviewStatus) || "pending",
    source: (row.source as ReviewSource) || "customer",
    show_on_home: row.showOnHome,
    created_at: row.createdAt.toISOString(),
    moderated_at: row.moderatedAt?.toISOString() ?? null,
  };
}
