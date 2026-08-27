/**
 * Course calculator helpers: one pack duration → packs for N months.
 */

const DAYS_PER_MONTH = 30;

/** Parse pack duration in days from free-text course field. */
export function parseCourseDays(course: string | null | undefined): number | null {
  if (!course || !String(course).trim()) return null;
  const text = String(course).toLowerCase().replace(/,/g, ".").trim();

  const monthMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:міс|мес|month|months|mo\b)/i
  );
  if (monthMatch) {
    const n = Number(monthMatch[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n * DAYS_PER_MONTH);
  }

  const weekMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:тижн|нед|week|weeks|w\b)/i
  );
  if (weekMatch) {
    const n = Number(weekMatch[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 7);
  }

  const dayMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(?:дн|день|дня|днів|дней|days?|d\b)/i
  );
  if (dayMatch) {
    const n = Number(dayMatch[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }

  // Bare number in field like "30"
  const bare = text.match(/^(\d+(?:\.\d+)?)$/);
  if (bare) {
    const n = Number(bare[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }

  return null;
}

/** Prefer explicit course_days, else parse from course text. */
export function resolvePackDays(
  courseDays: number | null | undefined,
  courseText: string | null | undefined
): number | null {
  if (
    typeof courseDays === "number" &&
    Number.isFinite(courseDays) &&
    courseDays > 0
  ) {
    return Math.round(courseDays);
  }
  return parseCourseDays(courseText);
}

export function packsForProgramMonths(
  packDays: number,
  months: number
): number {
  if (packDays <= 0 || months <= 0) return 1;
  return Math.max(1, Math.ceil((months * DAYS_PER_MONTH) / packDays));
}

export const COURSE_MONTH_OPTIONS = [1, 2, 3, 4] as const;

export const DEFAULT_COURSE_MONTHS = 2;
