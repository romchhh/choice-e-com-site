import { MetadataRoute } from "next";
import { sqlGetAllProducts, sqlGetAllCategories } from "@/lib/sql";
import { getSiteOrigin, sitemapLanguageAlternates } from "@/lib/i18n/seo";

type CategoryItem = { id: number; name: string; slug?: string | null };
type ProductItem = { id: number; name: string; slug?: string | null };

async function getProducts(): Promise<ProductItem[]> {
  try {
    return await sqlGetAllProducts();
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
    return [];
  }
}

async function getCategories(): Promise<CategoryItem[]> {
  try {
    return await sqlGetAllCategories();
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

type SitemapEntry = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  opts: {
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
    lastModified?: Date;
  }
): SitemapEntry[] {
  const origin = getSiteOrigin();
  const bare = path === "/" ? "/" : path;
  const ukUrl = bare === "/" ? origin : `${origin}${bare}`;
  const ruUrl = bare === "/" ? `${origin}/ru` : `${origin}/ru${bare}`;
  const alternates = sitemapLanguageAlternates(bare);
  const lastModified = opts.lastModified ?? new Date();

  return [
    {
      url: ukUrl,
      lastModified,
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
      alternates,
    },
    {
      url: ruUrl,
      lastModified,
      changeFrequency: opts.changeFrequency,
      priority: Math.max(0.35, opts.priority - 0.05),
      alternates,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const staticPaths: Array<{
    path: string;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/catalog", changeFrequency: "daily", priority: 0.95 },
    { path: "/contacts", changeFrequency: "monthly", priority: 0.7 },
    { path: "/info", changeFrequency: "monthly", priority: 0.7 },
    { path: "/partnership", changeFrequency: "monthly", priority: 0.65 },
    { path: "/delivery-and-payment", changeFrequency: "monthly", priority: 0.65 },
    { path: "/returns-and-exchange", changeFrequency: "monthly", priority: 0.55 },
    { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.4 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.4 },
  ];

  const staticEntries = staticPaths.flatMap((p) =>
    entry(p.path, {
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })
  );

  const categoryEntries = categories.flatMap((category) => {
    const slug = category.slug ?? encodeURIComponent(category.name);
    return entry(`/catalog/${slug}`, {
      changeFrequency: "weekly",
      priority: 0.85,
    });
  });

  const productEntries = products.flatMap((product) => {
    const slug = product.slug ?? String(product.id);
    return entry(`/product/${slug}`, {
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
