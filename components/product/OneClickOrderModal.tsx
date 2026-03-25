"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiscountedPrice } from "@/lib/pricing";

const DEFAULT_SIZE = "—";

type ProductForOneClick = {
  id: number;
  name: string;
  price: number;
  discount_percentage?: number | null;
  in_stock?: boolean;
  stock?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  product: ProductForOneClick;
  quantity: number;
};

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export default function OneClickOrderModal({
  open,
  onClose,
  product,
  quantity,
}: Props) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setCustomerName("");
      setPhone("");
      setEmail("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const unitPrice = getDiscountedPrice(product.price, product.discount_percentage);
  const linePrice = Math.round(unitPrice * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameTrim = customerName.trim();
    const phoneTrim = phone.trim();
    if (!nameTrim) {
      setError("Вкажіть ПІБ.");
      return;
    }
    const digits = normalizePhoneDigits(phoneTrim);
    if (digits.length < 9) {
      setError("Вкажіть коректний номер телефону.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          one_click: true,
          customer_name: nameTrim,
          phone_number: phoneTrim,
          email: email.trim() || null,
          payment_type: "prepay",
          delivery_cost: 0,
          items: [
            {
              product_id: product.id,
              product_name: product.name,
              size: DEFAULT_SIZE,
              quantity,
              price: linePrice,
            },
          ],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Не вдалося оформити замовлення. Спробуйте пізніше.";
        const details = data.details;
        if (Array.isArray(details)) {
          setError(`${msg}\n${details.join("\n")}`);
        } else {
          setError(msg);
        }
        setSubmitting(false);
        return;
      }

      const orderId = data.orderId as string | undefined;
      if (!orderId) {
        setError("Сервер не повернув номер замовлення.");
        setSubmitting(false);
        return;
      }

      onClose();
      router.push(`/success?orderReference=${encodeURIComponent(orderId)}`);
    } catch {
      setError("Помилка мережі. Перевірте з'єднання і спробуйте ще раз.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="one-click-title"
        className="w-full max-w-md rounded-xl bg-white shadow-xl border border-[#3D1A00]/10 p-6 sm:p-8 font-['Montserrat']"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 id="one-click-title" className="text-lg sm:text-xl font-semibold text-[#3D1A00] uppercase tracking-tight">
            Купити в 1 клік
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-[#3D1A00] hover:bg-[#3D1A00]/10 transition-colors text-xl leading-none"
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-[#3D1A00]/80 mb-4">
          Залиште контакти — менеджер уточнить доставку та відділення. Оплата — накладний платіж при
          отриманні.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="one-click-name" className="block text-xs font-medium text-[#3D1A00]/80 mb-1">
              ПІБ <span className="text-red-600">*</span>
            </label>
            <input
              id="one-click-name"
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-[#3D1A00]/20 rounded-lg px-4 py-3 text-sm text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/20"
              placeholder="Іванов Іван Іванович"
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="one-click-phone" className="block text-xs font-medium text-[#3D1A00]/80 mb-1">
              Телефон <span className="text-red-600">*</span>
            </label>
            <input
              id="one-click-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-[#3D1A00]/20 rounded-lg px-4 py-3 text-sm text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/20"
              placeholder="+380..."
              disabled={submitting}
            />
          </div>
          <div>
            <label htmlFor="one-click-email" className="block text-xs font-medium text-[#3D1A00]/80 mb-1">
              Email (необов&apos;язково)
            </label>
            <input
              id="one-click-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#3D1A00]/20 rounded-lg px-4 py-3 text-sm text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/20"
              placeholder="email@example.com"
              disabled={submitting}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 whitespace-pre-line" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-lg bg-[#D7D799] hover:bg-[#c5c58a] text-[#3D1A00] font-semibold uppercase text-sm tracking-tight border border-[#b8b87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Оформлення..." : "Оформити замовлення"}
          </button>
        </form>
      </div>
    </div>
  );
}
