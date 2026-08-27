import { prisma } from "@/lib/prisma";
import { mapPrismaReview, type ReviewDTO } from "@/lib/reviews";

const productSelect = {
  id: true,
  name: true,
  slug: true,
} as const;

export async function getApprovedHomeReviews(limit = 12): Promise<ReviewDTO[]> {
  const rows = await prisma.review.findMany({
    where: { status: "approved", showOnHome: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: { select: productSelect } },
  });
  return rows.map(mapPrismaReview);
}

export async function getApprovedProductReviews(
  productId: number
): Promise<ReviewDTO[]> {
  const rows = await prisma.review.findMany({
    where: { status: "approved", productId },
    orderBy: { createdAt: "desc" },
    include: { product: { select: productSelect } },
  });
  return rows.map(mapPrismaReview);
}

export async function getProductRatingSummary(productId: number): Promise<{
  average: number;
  count: number;
}> {
  const agg = await prisma.review.aggregate({
    where: { status: "approved", productId },
    _avg: { rating: true },
    _count: { id: true },
  });
  return {
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    count: agg._count.id,
  };
}
