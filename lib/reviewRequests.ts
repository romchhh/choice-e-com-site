import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const DAY_MS = 24 * 60 * 60 * 1000;
const REVIEW_DELAY_DAYS = 7;

function siteBaseUrl(): string {
  return (
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "https://forbody.space"
  ).replace(/\/$/, "");
}

export function buildReviewRequestHtml(opts: {
  customerName: string;
  products: { name: string }[];
  reviewUrl: string;
}): string {
  const productList = opts.products
    .map((p) => `<li style="margin:4px 0;">${escapeHtml(p.name)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8" /><title>Залиште відгук</title></head>
<body style="margin:0;padding:0;background:#FFF9F0;font-family:Montserrat,Arial,sans-serif;color:#3D1A00;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFF9F0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8DED0;">
        <tr><td style="background:#D7D799;padding:20px 24px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">ForBody Space</p>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">Як вам ваша покупка?</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.55;">
            Вітаємо${opts.customerName ? `, ${escapeHtml(opts.customerName)}` : ""}!
          </p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.55;">
            Минуло 7 днів після вашого замовлення — будемо вдячні за короткий відгук
            про товар(и). Це допомагає іншим покупцям зробити правильний вибір.
          </p>
          ${
            opts.products.length
              ? `<p style="margin:0 0 6px;font-size:13px;font-weight:600;">Ваші товари:</p>
                 <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.5;">${productList}</ul>`
              : ""
          }
          <p style="margin:0 0 24px;">
            <a href="${opts.reviewUrl}"
               style="display:inline-block;background:#3D1A00;color:#FFF9F0;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:700;">
              Залишити відгук
            </a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.5;color:#6B5A4A;">
            Якщо кнопка не працює, відкрийте посилання:<br />
            <a href="${opts.reviewUrl}" style="color:#8B9A47;word-break:break-all;">${opts.reviewUrl}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function createReviewToken(): string {
  return randomBytes(24).toString("hex");
}

/** Send (or resend) review invitation for a specific order. */
export async function sendReviewRequestForOrder(
  orderId: number,
  options?: { forceEmail?: string }
): Promise<{ ok: boolean; error?: string; email?: string; url?: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: { productName: true, productId: true },
      },
      reviewRequest: true,
    },
  });

  if (!order) return { ok: false, error: "Order not found" };

  const email = (options?.forceEmail || order.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Order has no email" };
  }

  let token = order.reviewRequest?.token;
  if (!token) {
    token = createReviewToken();
    await prisma.reviewRequest.upsert({
      where: { orderId: order.id },
      create: { orderId: order.id, email, token },
      update: { email, token },
    });
  } else if (order.reviewRequest && order.reviewRequest.email !== email) {
    await prisma.reviewRequest.update({
      where: { orderId: order.id },
      data: { email },
    });
  }

  const reviewUrl = `${siteBaseUrl()}/review?token=${token}`;
  const products = order.items
    .map((i) => ({ name: i.productName || "Товар" }))
    .filter((p, idx, arr) => arr.findIndex((x) => x.name === p.name) === idx);

  const result = await sendEmail({
    to: email,
    subject: "Залиште відгук про покупку — ForBody Space",
    text: `Вітаємо! Минуло 7 днів після замовлення. Залиште відгук: ${reviewUrl}`,
    html: buildReviewRequestHtml({
      customerName: order.customerName || "",
      products,
      reviewUrl,
    }),
  });

  if (!result.success) {
    return { ok: false, error: result.error || "Email failed", email, url: reviewUrl };
  }

  await prisma.reviewRequest.update({
    where: { orderId: order.id },
    data: { sentAt: new Date(), email },
  });

  return { ok: true, email, url: reviewUrl };
}

/**
 * Find paid orders ~7 days old without a sent review request and email them.
 */
export async function processDueReviewRequests(options?: {
  dryRun?: boolean;
}): Promise<{
  scanned: number;
  sent: number;
  errors: string[];
}> {
  const now = Date.now();
  const windowStart = new Date(now - (REVIEW_DELAY_DAYS + 1) * DAY_MS);
  const windowEnd = new Date(now - REVIEW_DELAY_DAYS * DAY_MS);

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: "paid",
      createdAt: { gte: windowStart, lte: windowEnd },
      email: { not: null },
      OR: [
        { reviewRequest: null },
        { reviewRequest: { sentAt: null } },
      ],
    },
    select: { id: true, email: true },
    take: 50,
  });

  const errors: string[] = [];
  let sent = 0;

  if (options?.dryRun) {
    return { scanned: orders.length, sent: 0, errors: [] };
  }

  for (const order of orders) {
    const res = await sendReviewRequestForOrder(order.id);
    if (res.ok) sent += 1;
    else if (res.error) errors.push(`#${order.id}: ${res.error}`);
  }

  return { scanned: orders.length, sent, errors };
}
