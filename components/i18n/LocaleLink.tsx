"use client";

import Link, { type LinkProps } from "next/link";
import { type ReactNode, type AnchorHTMLAttributes } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localePath } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";

type Props = Omit<LinkProps, "href"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    href: string;
    locale?: Locale;
    children?: ReactNode;
  };

/** Next Link that prefixes /ru when needed. External URLs pass through. */
export default function LocaleLink({ href, locale, children, ...rest }: Props) {
  const { locale: ctxLocale } = useLocale();
  const loc = locale ?? ctxLocale;
  const resolved =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
      ? href
      : localePath(href, loc);

  return (
    <Link href={resolved} {...rest}>
      {children}
    </Link>
  );
}
