import { NextRequest, NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type === "callback" ? "callback" : "contact";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Ім'я обов'язкове" },
        { status: 400 }
      );
    }

    if (type === "callback") {
      if (!phone) {
        return NextResponse.json(
          { error: "Телефон обов'язковий" },
          { status: 400 }
        );
      }
    } else {
      if (!emailRaw) {
        return NextResponse.json(
          { error: "Email обов'язковий" },
          { status: 400 }
        );
      }
      if (!message) {
        return NextResponse.json(
          { error: "Повідомлення обов'язкове" },
          { status: 400 }
        );
      }
    }

    const email =
      type === "callback"
        ? emailRaw || `callback+${phone.replace(/[^\d+]/g, "")}@forbody.space`
        : emailRaw;

    const composedMessage =
      type === "callback"
        ? `📞 ЗАПИТ НА ЗВОРОТНИЙ ДЗВІНОК\nТелефон: ${phone}\n${message || "Передзвоніть, будь ласка."}`
        : message;

    const sent = await sendContactFormNotification({
      name,
      email,
      message: composedMessage,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Не вдалося надіслати повідомлення. Спробуйте пізніше." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}
