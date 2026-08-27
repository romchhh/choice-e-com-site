import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  isBannerScheduledActive,
  mapPrismaHeroBanner,
  type HeroBannerDTO,
} from "@/lib/heroBanners";

async function fetchAllHeroBanners(): Promise<HeroBannerDTO[]> {
  const rows = await prisma.heroBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });
  return rows.map(mapPrismaHeroBanner);
}

export const getAllHeroBannersCached = unstable_cache(
  fetchAllHeroBanners,
  ["hero-banners-all"],
  { revalidate: 60, tags: ["hero-banners"] }
);

export async function getActiveHeroBanners(): Promise<HeroBannerDTO[]> {
  try {
    const all = await getAllHeroBannersCached();
    const now = new Date();
    return all.filter((b) => isBannerScheduledActive(b, now));
  } catch (error) {
    console.error("[getActiveHeroBanners]", error);
    return [];
  }
}

export async function getAllHeroBannersAdmin(): Promise<HeroBannerDTO[]> {
  const rows = await prisma.heroBanner.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  });
  return rows.map(mapPrismaHeroBanner);
}
