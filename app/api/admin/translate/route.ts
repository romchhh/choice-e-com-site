import { NextRequest, NextResponse } from "next/server";
import {
  translateFieldsUkToRu,
  translateUkToRu,
} from "@/lib/translate/freeTranslate";

/**
 * POST /api/admin/translate
 * Body: { text: string } | { fields: Record<string, string | null | undefined> }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body && typeof body.text === "string") {
      const text = body.text.trim();
      if (!text) {
        return NextResponse.json({ text: "" });
      }
      const translated = await translateUkToRu(text);
      return NextResponse.json({ text: translated ?? text });
    }

    if (body && body.fields && typeof body.fields === "object") {
      const fields = body.fields as Record<string, string | null | undefined>;
      const translated = await translateFieldsUkToRu(fields);
      return NextResponse.json({ fields: translated });
    }

    return NextResponse.json(
      { error: "Передайте text або fields" },
      { status: 400 }
    );
  } catch (e) {
    console.error("[admin/translate]", e);
    return NextResponse.json(
      { error: "Не вдалося перекласти" },
      { status: 500 }
    );
  }
}
