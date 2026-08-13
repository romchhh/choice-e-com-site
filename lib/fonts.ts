import { Montserrat } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-montserrat",
  adjustFontFallback: true,
});
