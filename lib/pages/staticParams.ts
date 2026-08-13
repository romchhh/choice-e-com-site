import { isSlugSafeForStaticGeneration } from "@/lib/slug";

export async function categorySlugsStaticParams() {
  try {
    const { sqlGetAllCategories } = await import("@/lib/sql");
    const categories = await sqlGetAllCategories();
    const params = categories
      .filter((c) => c.slug != null && isSlugSafeForStaticGeneration(c.slug!))
      .map((c) => ({ slug: c.slug! }));

    const skipped = categories.filter(
      (c) => c.slug != null && !isSlugSafeForStaticGeneration(c.slug!)
    ).length;
    if (skipped > 0) {
      console.warn(
        `[SSG] Skipped ${skipped} category slug(s) — too long for static prerender (still available on demand).`
      );
    }

    return params;
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
    });

    const withSlug = products.filter(
      (p: { slug: string | null }): p is { slug: string } => p.slug != null
    );

    const params = withSlug
      .filter((p) => isSlugSafeForStaticGeneration(p.slug))
      .map((p) => ({ slug: p.slug }));

    const skipped = withSlug.length - params.length;
    if (skipped > 0) {
      console.warn(
        `[SSG] Skipped ${skipped} product slug(s) — too long for static prerender (still available on demand).`
      );
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}
