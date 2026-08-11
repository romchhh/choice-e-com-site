/**
 * Free UK→RU translation:
 * 1) Google Translate (translate.googleapis.com, client=gtx) — primary
 * 2) MyMemory (api.mymemory.translated.net) — fallback
 *
 * Optional: MYMEMORY_EMAIL — higher free quota for MyMemory
 */

const GOOGLE_URL = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_URL = "https://api.mymemory.translated.net/get";

/** MyMemory free tier is picky about long `q`; keep chunks small. */
const MYMEMORY_MAX_CHARS = 450;
/** Avoid oversized GET URLs for Google. */
const GOOGLE_MAX_CHARS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeResult(text: string): string {
  return text.replace(/\u200b/g, "").trim();
}

function isWeakTranslation(source: string, translated: string | null | undefined): boolean {
  if (translated == null) return true;
  const t = normalizeResult(translated);
  if (!t) return true;
  if (/MYMEMORY WARNING/i.test(t)) return true;
  if (/QUERY LENGTH LIMIT EXCEEDED/i.test(t)) return true;
  const s = normalizeResult(source);
  if (!s) return true;
  // Identical Cyrillic source/target is often a failed/no-op translate
  if (s === t && /[а-яіїєґА-ЯІЇЄҐёЁ]/.test(s)) return true;
  return false;
}

async function translateGoogleChunk(text: string): Promise<string | null> {
  try {
    const url = new URL(GOOGLE_URL);
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "uk");
    url.searchParams.set("tl", "ru");
    url.searchParams.set("dt", "t");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("oe", "UTF-8");
    url.searchParams.set("q", text);

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ForBodySpace/1.0; +https://forbody.space)",
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

    const parts: string[] = [];
    for (const row of data[0] as unknown[]) {
      if (Array.isArray(row) && typeof row[0] === "string") parts.push(row[0]);
    }
    const joined = parts.join("");
    return joined ? normalizeResult(joined) : null;
  } catch {
    return null;
  }
}

async function translateMyMemoryChunk(text: string): Promise<string | null> {
  try {
    const url = new URL(MYMEMORY_URL);
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", "uk|ru");
    const email = process.env.MYMEMORY_EMAIL?.trim();
    if (email) url.searchParams.set("de", email);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number | string;
    };
    const status = Number(data.responseStatus);
    if (status && status !== 200) return null;
    const t = data.responseData?.translatedText;
    return typeof t === "string" ? normalizeResult(t) : null;
  } catch {
    return null;
  }
}

/** Split text into chunks on paragraph/sentence boundaries when possible. */
function chunkText(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return [trimmed];

  const chunks: string[] = [];
  let rest = trimmed;
  while (rest.length > maxChars) {
    let cut = rest.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.4) cut = rest.lastIndexOf(". ", maxChars);
    if (cut < maxChars * 0.4) cut = rest.lastIndexOf(" ", maxChars);
    if (cut < maxChars * 0.4) cut = maxChars;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.filter(Boolean);
}

async function translateWithProvider(
  text: string,
  maxChars: number,
  translateChunk: (chunk: string) => Promise<string | null>,
  delayMs: number
): Promise<string | null> {
  const chunks = chunkText(text, maxChars);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const part = await translateChunk(chunks[i]);
    if (part == null || isWeakTranslation(chunks[i], part)) return null;
    out.push(part);
    if (i < chunks.length - 1 && delayMs > 0) await sleep(delayMs);
  }
  return normalizeResult(out.join(text.includes("\n") ? "\n" : " "));
}

/**
 * Translate Ukrainian text to Russian.
 * Google first; MyMemory if Google fails or returns a weak result.
 */
export async function translateUkToRu(
  text: string,
  opts?: { retries?: number }
): Promise<string> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return text ?? "";

  const retries = opts?.retries ?? 2;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const google = await translateWithProvider(
        trimmed,
        GOOGLE_MAX_CHARS,
        translateGoogleChunk,
        120
      );
      if (google && !isWeakTranslation(trimmed, google)) {
        return google;
      }

      const memory = await translateWithProvider(
        trimmed,
        MYMEMORY_MAX_CHARS,
        translateMyMemoryChunk,
        250
      );
      if (memory && !isWeakTranslation(trimmed, memory)) {
        return memory;
      }

      lastError = new Error("Google і MyMemory не повернули валідний переклад");
    } catch (e) {
      lastError = e;
    }
    await sleep(400 * (attempt + 1));
  }

  const msg =
    lastError instanceof Error ? lastError.message : String(lastError ?? "translate failed");
  console.error("[translateUkToRu]", msg);
  throw lastError instanceof Error ? lastError : new Error(msg);
}

/** Translate many fields; empty/null stay as-is. Soft delay between fields. */
export async function translateFieldsUkToRu(
  fields: Record<string, string | null | undefined>,
  delayMs = 200
): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  let attempted = 0;
  let failed = 0;

  for (const [key, value] of Object.entries(fields)) {
    if (value == null || String(value).trim() === "") {
      out[key] = value ?? null;
      continue;
    }
    attempted += 1;
    try {
      out[key] = await translateUkToRu(String(value));
    } catch (e) {
      failed += 1;
      console.error(
        `[translate] field ${key} failed:`,
        e instanceof Error ? e.message : e
      );
      out[key] = null;
    }
    if (delayMs > 0) await sleep(delayMs);
  }

  if (attempted > 0 && failed === attempted) {
    throw new Error("Переклад: усі поля не вдалося перекласти (Google + MyMemory)");
  }

  return out;
}
