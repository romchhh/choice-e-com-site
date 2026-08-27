#!/usr/bin/env ts-node

/**
 * Надіслати тестовий лист із проханням про відгук.
 *
 * npm run test:review-email
 * npm run test:review-email -- roman.fedoniuk@gmail.com
 */

import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

function loadEnv(): void {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    value = value.split(/\s+#\s+/)[0].trim();
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteBaseUrl(): string {
  return (
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "https://forbody.space"
  ).replace(/\/$/, "");
}

function buildHtml(opts: {
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

async function main() {
  loadEnv();
  const email =
    process.argv[2]?.trim() || "roman.fedoniuk@gmail.com";

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY не задано в .env");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    let order = await prisma.order.findFirst({
      where: { paymentStatus: "paid" },
      orderBy: { createdAt: "desc" },
      include: {
        items: { select: { productName: true } },
        reviewRequest: true,
      },
    });

    if (!order) {
      order = await prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { productName: true } },
          reviewRequest: true,
        },
      });
    }

    if (!order) {
      console.error("❌ У базі немає замовлень. Створіть хоча б одне замовлення.");
      process.exit(1);
    }

    let token = order.reviewRequest?.token;
    if (!token) {
      token = randomBytes(24).toString("hex");
      await prisma.reviewRequest.upsert({
        where: { orderId: order.id },
        create: { orderId: order.id, email, token },
        update: { email, token },
      });
    } else {
      await prisma.reviewRequest.update({
        where: { orderId: order.id },
        data: { email },
      });
    }

    const reviewUrl = `${siteBaseUrl()}/review?token=${token}`;
    const products = order.items
      .map((i) => ({ name: i.productName || "Товар" }))
      .filter((p, idx, arr) => arr.findIndex((x) => x.name === p.name) === idx);

    console.log(
      `Відправляємо тестовий лист про відгук на ${email} (order #${order.id})…`
    );

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Залиште відгук про покупку — ForBody Space",
      text: `Вітаємо! Минуло 7 днів після замовлення. Залиште відгук: ${reviewUrl}`,
      html: buildHtml({
        customerName: order.customerName || "",
        products,
        reviewUrl,
      }),
    });

    if (error) {
      console.error("❌ Resend:", error.message);
      process.exit(1);
    }

    await prisma.reviewRequest.update({
      where: { orderId: order.id },
      data: { sentAt: new Date(), email },
    });

    console.log("✅ Лист надіслано.");
    console.log("   From:", fromEmail);
    console.log("   To:", email);
    console.log("   URL форми:", reviewUrl);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
