import { NextRequest, NextResponse } from "next/server";
import {
  processDueReviewRequests,
  sendReviewRequestForOrder,
} from "@/lib/reviewRequests";
import { prisma } from "@/lib/prisma";

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Allow in development without secret
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const query = req.nextUrl.searchParams.get("secret");
  return bearer === secret || query === secret;
}

/**
 * POST /api/cron/review-requests
 * - Default: process orders due for 7-day review emails
 * - ?test=1&email=... : send a test invitation (uses latest paid order or creates token against latest order)
 */
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const test = req.nextUrl.searchParams.get("test") === "1";
    const testEmail =
      req.nextUrl.searchParams.get("email")?.trim() ||
      "roman.fedoniuk@gmail.com";

    if (test) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentStatus: "paid" },
            { email: { not: null } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true },
      });

      if (!order) {
        return NextResponse.json(
          {
            error:
              "Немає замовлень для тесту. Створіть тестове замовлення або вкажіть orderId.",
          },
          { status: 404 }
        );
      }

      const bodyOrderId = Number(
        (await req.json().catch(() => ({}))).orderId
      );
      const orderId =
        Number.isInteger(bodyOrderId) && bodyOrderId > 0
          ? bodyOrderId
          : order.id;

      const result = await sendReviewRequestForOrder(orderId, {
        forceEmail: testEmail,
      });

      return NextResponse.json({
        test: true,
        orderId,
        ...result,
      });
    }

    const result = await processDueReviewRequests();
    return NextResponse.json(result);
  } catch (e) {
    console.error("[cron/review-requests]", e);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
