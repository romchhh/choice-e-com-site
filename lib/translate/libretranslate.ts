/**
 * LibreTranslate client (uk → ru).
 * Env: LIBRETRANSLATE_URL (default https://libretranslate.com), LIBRETRANSLATE_API_KEY
 */

const DEFAULT_URL = "https://libretranslate.com";

function getBaseUrl(): string {
  return (process.env.LIBRETRANSLATE_URL || DEFAULT_URL).replace(/\/$/, "");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function translateUkToRu(
  text: string,
  opts?: { retries?: number }
): Promise<string> {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return text ?? "";

  const retries = opts?.retries ?? 3;
  const url = `${getBaseUrl()}/translate`;
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;

  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const body: Record<string, string> = {
        q: trimmed,
        source: "uk",
        target: "ru",
        format: "text",
      };
      if (apiKey) body.api_key = apiKey;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        await sleep(1000 * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`LibreTranslate ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as { translatedText?: string };
      if (typeof data.translatedText === "string") {
        return data.translatedText;
      }
      throw new Error("LibreTranslate: missing translatedText");
    } catch (e) {
      lastError = e;
      await sleep(500 * (attempt + 1));
    }
  }

  console.error("[LibreTranslate] failed:", lastError);
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Translate many fields; empty/null stay as-is. Rate-limits between calls. */
export async function translateFieldsUkToRu(
  fields: Record<string, string | null | undefined>,
  delayMs = 350
): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value == null || String(value).trim() === "") {
      out[key] = value ?? null;
      continue;
    }
    try {
      out[key] = await translateUkToRu(String(value));
    } catch (e) {
      console.error(`[LibreTranslate] field ${key} failed:`, e);
      out[key] = null;
    }
    if (delayMs > 0) await sleep(delayMs);
  }
  return out;
}
