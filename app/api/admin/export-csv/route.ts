import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toCsvLine } from "@/lib/csv";

const ALLOWED = new Set(["products", "orders", "order_items", "users"]);

/**
 * GET /api/admin/export-csv?part=products|orders|order_items|users
 * UTF-8 з BOM для Excel.
 */
export async function GET(req: NextRequest) {
  const part = req.nextUrl.searchParams.get("part") || "";
  if (!ALLOWED.has(part)) {
    return NextResponse.json(
      { error: "Вкажіть part: products, orders, order_items або users" },
      { status: 400 }
    );
  }

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  try {
    if (part === "products") {
      const rows = await prisma.product.findMany({
        orderBy: { id: "asc" },
        include: {
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
        },
      });
      const header = toCsvLine([
        "id",
        "name",
        "slug",
        "subtitle",
        "short_description",
        "description",
        "price",
        "old_price",
        "discount_percentage",
        "in_stock",
        "stock",
        "is_promo",
        "free_delivery_badge",
        "doctor_choice_badge",
        "is_hit",
        "dietitian_approved",
        "gift_product_id",
        "category_id",
        "category_name",
        "subcategory_id",
        "subcategory_name",
        "release_form",
        "course",
        "package_weight",
        "priority",
        "top_sale",
        "created_at",
      ]);
      const lines = rows.map((p) =>
        toCsvLine([
          p.id,
          p.name,
          p.slug ?? "",
          p.subtitle ?? "",
          p.shortDescription ?? "",
          p.description ?? "",
          Number(p.price),
          p.oldPrice != null ? Number(p.oldPrice) : "",
          p.discountPercentage ?? "",
          p.inStock,
          p.stock,
          p.isPromo,
          p.freeDeliveryBadge,
          p.doctorChoiceBadge,
          p.isHit,
          p.dietitianApproved,
          p.giftProductId ?? "",
          p.categoryId ?? "",
          p.category?.name ?? "",
          p.subcategoryId ?? "",
          p.subcategory?.name ?? "",
          p.releaseForm ?? "",
          p.course ?? "",
          p.packageWeight ?? "",
          p.priority,
          p.topSale,
          p.createdAt.toISOString(),
        ])
      );
      const csv = "\uFEFF" + [header, ...lines].join("\n") + "\n";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products-${stamp}.csv"`,
        },
      });
    }

    if (part === "orders") {
      const rows = await prisma.order.findMany({
        orderBy: { id: "asc" },
        include: {
          user: { select: { id: true, email: true, name: true, phone: true } },
          promoCode: { select: { code: true } },
        },
      });
      const header = toCsvLine([
        "id",
        "invoice_id",
        "customer_name",
        "phone_number",
        "email",
        "city",
        "post_office",
        "delivery_method",
        "payment_type",
        "payment_status",
        "comment",
        "status",
        "bonus_points_spent",
        "loyalty_discount_amount",
        "promo_code",
        "promo_discount_amount",
        "user_id",
        "user_email",
        "user_name",
        "created_at",
      ]);
      const lines = rows.map((o) =>
        toCsvLine([
          o.id,
          o.invoiceId,
          o.customerName,
          o.phoneNumber,
          o.email ?? "",
          o.city,
          o.postOffice,
          o.deliveryMethod,
          o.paymentType,
          o.paymentStatus,
          o.comment ?? "",
          o.status ?? "",
          o.bonusPointsSpent,
          o.loyaltyDiscountAmount != null ? Number(o.loyaltyDiscountAmount) : "",
          o.promoCode?.code ?? "",
          o.promoDiscountAmount != null ? Number(o.promoDiscountAmount) : "",
          o.userId ?? "",
          o.user?.email ?? "",
          o.user?.name ?? "",
          o.createdAt.toISOString(),
        ])
      );
      const csv = "\uFEFF" + [header, ...lines].join("\n") + "\n";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="orders-${stamp}.csv"`,
        },
      });
    }

    if (part === "order_items") {
      const rows = await prisma.orderItem.findMany({
        orderBy: [{ orderId: "asc" }, { id: "asc" }],
      });
      const header = toCsvLine([
        "id",
        "order_id",
        "product_id",
        "product_name",
        "size",
        "quantity",
        "price",
        "color",
      ]);
      const lines = rows.map((i) =>
        toCsvLine([
          i.id,
          i.orderId,
          i.productId ?? "",
          i.productName ?? "",
          i.size,
          i.quantity,
          Number(i.price),
          i.color ?? "",
        ])
      );
      const csv = "\uFEFF" + [header, ...lines].join("\n") + "\n";
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="order-items-${stamp}.csv"`,
        },
      });
    }

    // users (клієнти) — без пароля
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        clothingSize: true,
        birthDate: true,
        bonusPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const header = toCsvLine([
      "id",
      "name",
      "email",
      "phone",
      "address",
      "clothing_size",
      "birth_date",
      "bonus_points",
      "created_at",
      "updated_at",
    ]);
    const lines = rows.map((u) =>
      toCsvLine([
        u.id,
        u.name ?? "",
        u.email ?? "",
        u.phone ?? "",
        u.address ?? "",
        u.clothingSize ?? "",
        u.birthDate?.toISOString() ?? "",
        u.bonusPoints,
        u.createdAt.toISOString(),
        u.updatedAt.toISOString(),
      ])
    );
    const csv = "\uFEFF" + [header, ...lines].join("\n") + "\n";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users-${stamp}.csv"`,
      },
    });
  } catch (e) {
    console.error("[admin/export-csv]", e);
    return NextResponse.json({ error: "Не вдалося сформувати CSV" }, { status: 500 });
  }
}
