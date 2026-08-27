import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

/**
 * POST /api/reviews/upload
 * Public review photo upload — requires a valid review invitation token.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token =
      typeof formData.get("token") === "string"
        ? String(formData.get("token")).trim()
        : "";
    const file = formData.get("photo") ?? formData.get("images");

    if (!token) {
      return NextResponse.json(
        { error: "Потрібен токен відгуку" },
        { status: 401 }
      );
    }

    const request = await prisma.reviewRequest.findUnique({
      where: { token },
      select: { id: true },
    });
    if (!request) {
      return NextResponse.json(
        { error: "Недійсне посилання для відгуку" },
        { status: 401 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Файл не надано" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Максимальний розмір файлу — 8 МБ" },
        { status: 413 }
      );
    }

    const mime = (file.type || "").toLowerCase();
    const looksLikeImage =
      mime.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || "");
    if (!looksLikeImage || (mime && !ALLOWED_TYPES.has(mime) && !mime.startsWith("image/"))) {
      return NextResponse.json(
        { error: "Дозволені лише зображення" },
        { status: 415 }
      );
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const tempExt = (file.name.split(".").pop() || "bin").toLowerCase();
    const tempName = `${crypto.randomUUID()}.${tempExt}`;
    const tempPath = path.join(uploadDir, tempName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, buffer);

    let finalName = tempName;
    try {
      finalName = `${crypto.randomUUID()}.webp`;
      const outputPath = path.join(uploadDir, finalName);
      await sharp(tempPath)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);
      await unlink(tempPath).catch(() => undefined);
    } catch {
      // keep original if conversion fails
      finalName = tempName;
    }

    return NextResponse.json(
      { media: [{ type: "photo", url: finalName }] },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/reviews/upload]", e);
    return NextResponse.json(
      { error: "Не вдалося завантажити фото" },
      { status: 500 }
    );
  }
}
