import { buildMerchantFeed } from "@/lib/merchantFeed";

/** Явний RU-фід товарів для Merchant Center / реклами. */
export async function GET() {
  return buildMerchantFeed("ru");
}
