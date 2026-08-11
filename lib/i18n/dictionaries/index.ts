import type { Locale } from "../config";
import { uk } from "./uk";
import { ru } from "./ru";

export type Dictionary = typeof uk;

/** Compile-time check: RU must match UK keys/structure. */
const _ruSatisfiesUk: Dictionary = ru;

const dictionaries: Record<Locale, Dictionary> = {
  uk,
  ru: _ruSatisfiesUk,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.uk;
}

export { uk, ru };
