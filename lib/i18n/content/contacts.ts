import type { Locale } from "../config";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

const uk = {
  metaTitle: `Контакти | ${SITE_STORE_NAME}`,
  metaDescription: `Зв'яжіться з ${SITE_STORE_NAME}: телефон, email, адреса та форма зворотного зв'язку.`,
  home: "Головна",
  title: "Контакти",
  formTitle: `Зв'язатися з ForBody`,
  success: "Дякуємо! Ми отримали ваше повідомлення і зв'яжемося найближчим часом.",
  nameLabel: "ІМ'Я *",
  namePlaceholder: "Ваше ім'я",
  emailLabel: "EMAIL *",
  messageLabel: "ВАШ ЗАПИТ *",
  messageHint: "Що ви хочете дізнатися/замовити?",
  consentBefore: "Продовжуючи, я приймаю умови",
  publicOffer: "Публічної оферти",
  consentAnd: "та надаю згоду на обробку своїх персональних даних відповідно до",
  privacyPolicy: "Політики конфіденційності",
  send: "Відправити",
  sending: "Відправка…",
  errorSend: "Помилка відправки",
  errorRetry: "Помилка відправки. Спробуйте пізніше.",
  phone: "Телефон",
  social: "Соц-мережі",
  address: "Адреса",
  email: "E-mail",
  schedule: "Графік роботи",
  addressLines: [
    "Україна, 49069, Дніпропетровська обл., місто Дніпро",
    "вулиця Січових Стрільців, будинок 127а",
  ],
  scheduleLines: [
    "Пн.-Пт.: 11.00 - 18.00",
    "Сб.-Нд.: за попередньою домовленістю",
  ],
};

const ru: typeof uk = {
  metaTitle: `Контакты | ${SITE_STORE_NAME}`,
  metaDescription: `Свяжитесь с ${SITE_STORE_NAME}: телефон, email, адрес и форма обратной связи.`,
  home: "Главная",
  title: "Контакты",
  formTitle: "Связаться с ForBody",
  success: "Спасибо! Мы получили ваше сообщение и свяжемся в ближайшее время.",
  nameLabel: "ИМЯ *",
  namePlaceholder: "Ваше имя",
  emailLabel: "EMAIL *",
  messageLabel: "ВАШ ЗАПРОС *",
  messageHint: "Что вы хотите узнать/заказать?",
  consentBefore: "Продолжая, я принимаю условия",
  publicOffer: "Публичной оферты",
  consentAnd: "и даю согласие на обработку своих персональных данных в соответствии с",
  privacyPolicy: "Политикой конфиденциальности",
  send: "Отправить",
  sending: "Отправка…",
  errorSend: "Ошибка отправки",
  errorRetry: "Ошибка отправки. Попробуйте позже.",
  phone: "Телефон",
  social: "Соцсети",
  address: "Адрес",
  email: "E-mail",
  schedule: "График работы",
  addressLines: [
    "Украина, 49069, Днепропетровская обл., город Днепр",
    "улица Сечевых Стрельцов, дом 127а",
  ],
  scheduleLines: [
    "Пн.-Пт.: 11.00 - 18.00",
    "Сб.-Вс.: по предварительной договорённости",
  ],
};

export type ContactsCopy = typeof uk;

const map = { uk, ru } as const;

export function getContactsCopy(locale: Locale): ContactsCopy {
  return map[locale] ?? uk;
}
