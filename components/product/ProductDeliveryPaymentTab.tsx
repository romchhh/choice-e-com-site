import Link from "next/link";

export default function ProductDeliveryPaymentTab() {
  return (
    <div className="space-y-8 text-[#3D1A00]/90 font-['Montserrat'] font-normal leading-[1.86] tracking-[-0.02em] text-sm md:text-base">
      <div>
        <h3 className="text-[#3D1A00] font-semibold uppercase text-xs md:text-sm tracking-wide mb-3">
          Оплата
        </h3>
        <p className="text-[#3D1A00]/85 mb-3">Оплатити замовлення можна:</p>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50 text-[#3D1A00]/90">
          <li>
            <strong className="font-semibold text-[#3D1A00]">Банківською карткою</strong> (Visa /
            Mastercard) під час оформлення на сайті.
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">Google Pay, Apple Pay</strong> — під
            час оформлення на сайті.
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">На картку або реквізити ФОП</strong> —
            за реквізитами після узгодження замовлення.
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">Післяплатою у відділенні «Нової
            пошти»</strong> — без онлайн-передоплати. Комісія НП за грошовий переказ:{" "}
            <span className="whitespace-nowrap">2% + 20 грн</span> (деталі на{" "}
            <a
              href="https://novaposhta.ua/shipping-cost"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D1A00] underline underline-offset-2 hover:opacity-80"
            >
              novaposhta.ua
            </a>
            ).
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-[#3D1A00] font-semibold uppercase text-xs md:text-sm tracking-wide mb-3">
          Доставка
        </h3>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50 mb-4">
          <li>
            <strong className="font-semibold text-[#3D1A00]">Від 80 грн</strong> — орієнтовна
            вартість за тарифами перевізника (розмір/вага).
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">Безкоштовно</strong> — при замовленні
            від <strong>2000 грн</strong> (якщо не діють інші акції).
          </li>
        </ul>
        <p className="text-[#3D1A00]/85 font-medium mb-2">Способи доставки:</p>
        <ul className="space-y-2 list-disc pl-5 marker:text-[#3D1A00]/50">
          <li>
            Відділення або поштомат <strong className="font-semibold text-[#3D1A00]">«Нової
            пошти»</strong>.
          </li>
          <li>
            <strong className="font-semibold text-[#3D1A00]">Кур’єр «Нової пошти»</strong> — на
            вказану адресу; після відправлення — трек-номер.
          </li>
          <li>
            Відділення <strong className="font-semibold text-[#3D1A00]">«Укрпошти»</strong>.
          </li>
        </ul>
        <p className="text-[#3D1A00]/75 text-sm mt-4 leading-relaxed">
          Орієнтовні терміни: НП у межах міста — до 1 дня; між містами — 1–2 дні; Укрпошта — 4–7
          робочих днів. Після відправлення отримаєте SMS з номером відстеження.
        </p>
      </div>

      <p className="text-sm text-[#3D1A00]/70 pt-2 border-t border-[#3D1A00]/10">
        <Link
          href="/delivery-and-payment"
          className="text-[#3D1A00] font-medium underline underline-offset-2 hover:opacity-80"
        >
          Повні умови доставки та оплати
        </Link>
      </p>
    </div>
  );
}
