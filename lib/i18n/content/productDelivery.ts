import type { Locale } from "../config";

const uk = {
  paymentTitle: "Оплата",
  paymentIntro: "Оплатити замовлення можна:",
  cardStrong: "Банківською карткою",
  cardRest: " (Visa / Mastercard) під час оформлення на сайті.",
  payServicesStrong: "Google Pay, Apple Pay",
  payServicesRest: " — під час оформлення на сайті.",
  fopStrong: "На картку або реквізити ФОП",
  fopRest: " — за реквізитами після узгодження замовлення.",
  codStrong: "Післяплатою у відділенні «Нової пошти»",
  codRest: " — без онлайн-передоплати. Комісія НП за грошовий переказ: ",
  codFee: "2% + 20 грн",
  codDetails: " (деталі на ",
  deliveryTitle: "Доставка",
  from80Strong: "Від 80 грн",
  from80Rest: " — орієнтовна вартість за тарифами перевізника (розмір/вага).",
  freeStrong: "Безкоштовно",
  freeRest: " — при замовленні від ",
  freeAmount: "2000 грн",
  freeRest2: " (якщо не діють інші акції).",
  methodsLabel: "Способи доставки:",
  branchBefore: "Відділення або поштомат ",
  branchStrong: "«Нової пошти»",
  branchAfter: ".",
  courierStrong: "Кур'єр «Нової пошти»",
  courierRest: " — на вказану адресу; після відправлення — трек-номер.",
  upBefore: "Відділення ",
  upStrong: "«Укрпошти»",
  upAfter: ".",
  timing:
    "Орієнтовні терміни: НП у межах міста — до 1 дня; між містами — 1–2 дні; Укрпошта — 4–7 робочих днів. Після відправлення отримаєте SMS з номером відстеження.",
  fullTerms: "Повні умови доставки та оплати",
};

const ru: typeof uk = {
  paymentTitle: "Оплата",
  paymentIntro: "Оплатить заказ можно:",
  cardStrong: "Банковской картой",
  cardRest: " (Visa / Mastercard) при оформлении на сайте.",
  payServicesStrong: "Google Pay, Apple Pay",
  payServicesRest: " — при оформлении на сайте.",
  fopStrong: "На карту или реквизиты ФЛП",
  fopRest: " — по реквизитам после согласования заказа.",
  codStrong: "Наложенным платежом в отделении «Новой почты»",
  codRest: " — без онлайн-предоплаты. Комиссия НП за денежный перевод: ",
  codFee: "2% + 20 грн",
  codDetails: " (детали на ",
  deliveryTitle: "Доставка",
  from80Strong: "От 80 грн",
  from80Rest: " — ориентировочная стоимость по тарифам перевозчика (размер/вес).",
  freeStrong: "Бесплатно",
  freeRest: " — при заказе от ",
  freeAmount: "2000 грн",
  freeRest2: " (если не действуют другие акции).",
  methodsLabel: "Способы доставки:",
  branchBefore: "Отделение или почтомат ",
  branchStrong: "«Новой почты»",
  branchAfter: ".",
  courierStrong: "Курьер «Новой почты»",
  courierRest: " — на указанный адрес; после отправки — трек-номер.",
  upBefore: "Отделение ",
  upStrong: "«Укрпочты»",
  upAfter: ".",
  timing:
    "Ориентировочные сроки: НП в пределах города — до 1 дня; между городами — 1–2 дня; Укрпочта — 4–7 рабочих дней. После отправки получите SMS с номером отслеживания.",
  fullTerms: "Полные условия доставки и оплаты",
};

export type ProductDeliveryCopy = typeof uk;

const map = { uk, ru } as const;

export function getProductDeliveryCopy(locale: Locale): ProductDeliveryCopy {
  return map[locale] ?? uk;
}
