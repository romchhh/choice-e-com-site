import type { Locale } from "@/lib/i18n/config";

export type HeroCtaColorId =
  | "sage"
  | "olive"
  | "brown"
  | "white"
  | "cream";

export const HERO_CTA_PALETTE: ReadonlyArray<{
  id: HeroCtaColorId;
  label: string;
  bg: string;
  hover: string;
  text: string;
  shadow: string;
}> = [
  {
    id: "sage",
    label: "Салатовий",
    bg: "#D7D799",
    hover: "#cfd48a",
    text: "#3D1A00",
    shadow: "rgba(215, 215, 153, 0.4)",
  },
  {
    id: "olive",
    label: "Оливковий",
    bg: "#8B9A47",
    hover: "#7a8940",
    text: "#FFFFFF",
    shadow: "rgba(139, 154, 71, 0.35)",
  },
  {
    id: "brown",
    label: "Коричневий",
    bg: "#3D1A00",
    hover: "#2d1400",
    text: "#FFFFFF",
    shadow: "rgba(61, 26, 0, 0.35)",
  },
  {
    id: "white",
    label: "Білий",
    bg: "#FFFFFF",
    hover: "#f5f5f5",
    text: "#3D1A00",
    shadow: "rgba(255, 255, 255, 0.25)",
  },
  {
    id: "cream",
    label: "Кремовий",
    bg: "#FFFBF5",
    hover: "#f5efe6",
    text: "#3D1A00",
    shadow: "rgba(255, 251, 245, 0.3)",
  },
];

export const DEFAULT_HERO_CTA_COLOR: HeroCtaColorId = "sage";

export function resolveHeroCtaColor(
  id: string | null | undefined
): (typeof HERO_CTA_PALETTE)[number] {
  const found = HERO_CTA_PALETTE.find((c) => c.id === id);
  return found ?? HERO_CTA_PALETTE[0];
}

export function normalizeHeroCtaColor(raw: unknown): HeroCtaColorId | null {
  if (raw == null || raw === "") return null;
  const id = String(raw).trim();
  return HERO_CTA_PALETTE.some((c) => c.id === id)
    ? (id as HeroCtaColorId)
    : null;
}

export type HeroBannerDTO = {
  id: number;
  title: string;
  title_ru: string | null;
  subtitle: string | null;
  subtitle_ru: string | null;
  badge: string | null;
  badge_ru: string | null;
  benefit_text: string | null;
  benefit_text_ru: string | null;
  price_label: string | null;
  price_label_ru: string | null;
  cta_label: string;
  cta_label_ru: string | null;
  cta_color: string | null;
  href: string;
  image_url: string;
  image_url_mobile: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export type LocalizedHeroSlide = {
  id: number;
  badge: string | null;
  title: string;
  subtitle: string | null;
  benefitText: string | null;
  priceLabel: string | null;
  ctaLabel: string;
  href: string;
  ctaColor: HeroCtaColorId | null;
  secondaryCtaLabel?: string | null;
  secondaryHref?: string | null;
  imageUrl: string;
  imageUrlMobile: string | null;
};

function pick(
  ua: string | null | undefined,
  ru: string | null | undefined,
  locale: Locale
): string | null {
  if (locale === "ru" && ru != null && String(ru).trim() !== "") return ru;
  if (ua != null && String(ua).trim() !== "") return ua;
  return ru != null && String(ru).trim() !== "" ? ru : null;
}

/** Resolve stored image path to a public URL. */
export function resolveHeroImageSrc(url: string | null | undefined): string {
  if (!url) return "/images/hero.jpg";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  return `/api/images/${trimmed}`;
}

export function localizeHeroBanner(
  banner: HeroBannerDTO,
  locale: Locale
): LocalizedHeroSlide {
  return {
    id: banner.id,
    badge: pick(banner.badge, banner.badge_ru, locale),
    title: pick(banner.title, banner.title_ru, locale) || banner.title,
    subtitle: pick(banner.subtitle, banner.subtitle_ru, locale),
    benefitText: pick(banner.benefit_text, banner.benefit_text_ru, locale),
    priceLabel: pick(banner.price_label, banner.price_label_ru, locale),
    ctaLabel:
      pick(banner.cta_label, banner.cta_label_ru, locale) || banner.cta_label,
    href: banner.href || "/catalog",
    ctaColor: normalizeHeroCtaColor(banner.cta_color),
    imageUrl: resolveHeroImageSrc(banner.image_url),
    imageUrlMobile: banner.image_url_mobile
      ? resolveHeroImageSrc(banner.image_url_mobile)
      : null,
  };
}

export function mapPrismaHeroBanner(row: {
  id: number;
  title: string;
  titleRu: string | null;
  subtitle: string | null;
  subtitleRu: string | null;
  badge: string | null;
  badgeRu: string | null;
  benefitText: string | null;
  benefitTextRu: string | null;
  priceLabel: string | null;
  priceLabelRu: string | null;
  ctaLabel: string;
  ctaLabelRu: string | null;
  ctaColor: string | null;
  href: string;
  imageUrl: string;
  imageUrlMobile: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}): HeroBannerDTO {
  return {
    id: row.id,
    title: row.title,
    title_ru: row.titleRu,
    subtitle: row.subtitle,
    subtitle_ru: row.subtitleRu,
    badge: row.badge,
    badge_ru: row.badgeRu,
    benefit_text: row.benefitText,
    benefit_text_ru: row.benefitTextRu,
    price_label: row.priceLabel,
    price_label_ru: row.priceLabelRu,
    cta_label: row.ctaLabel,
    cta_label_ru: row.ctaLabelRu,
    cta_color: row.ctaColor,
    href: row.href,
    image_url: row.imageUrl,
    image_url_mobile: row.imageUrlMobile,
    sort_order: row.sortOrder,
    is_active: row.isActive,
    starts_at: row.startsAt?.toISOString() ?? null,
    ends_at: row.endsAt?.toISOString() ?? null,
  };
}

export function isBannerScheduledActive(
  banner: Pick<HeroBannerDTO, "is_active" | "starts_at" | "ends_at">,
  now = new Date()
): boolean {
  if (!banner.is_active) return false;
  if (banner.starts_at && new Date(banner.starts_at) > now) return false;
  if (banner.ends_at && new Date(banner.ends_at) < now) return false;
  return true;
}

/** Recommended hero banner image specs for admin hints. */
export const HERO_IMAGE_SPECS = {
  desktop: {
    label: "Комп'ютер",
    recommendedSize: "1920 × 900 px",
    aspectRatio: "16∶9",
    formats: "JPG, PNG, WebP",
    maxWeight: "до 2 МБ",
    hint: "Горизонтальне фото. Текст накладається зліва — важливі деталі тримайте в лівій половині кадру.",
  },
  mobile: {
    label: "Мобільний",
    recommendedSize: "1080 × 1920 px",
    aspectRatio: "9∶16",
    formats: "JPG, PNG, WebP",
    maxWeight: "до 1.5 МБ",
    hint: "Вертикальне фото, контент по центру. Якщо не завантажити — на телефоні показується desktop-версія.",
  },
} as const;
