export async function categorySlugsStaticParams() {
  try {
    const { sqlGetAllCategories } = await import("@/lib/sql");
    const categories = await sqlGetAllCategories();
    return categories
      .filter((c) => c.slug != null)
      .map((c) => ({ slug: c.slug! }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function productSlugsStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return products
      .filter((p: { slug: string | null }): p is { slug: string } => p.slug != null)
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
