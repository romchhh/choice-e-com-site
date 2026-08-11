import { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/i18n/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/private/",
          "/final",
          "/ru/final",
          "/success",
          "/ru/success",
          "/forbidden",
          "/ru/forbidden",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/images/", "/ru/", "/catalog", "/ru/catalog", "/product", "/ru/product"],
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/private/",
          "/final",
          "/ru/final",
          "/success",
          "/ru/success",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/images/"],
        disallow: ["/admin/", "/api/", "/_next/", "/private/"],
      },
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "Yandex", allow: ["/", "/ru/"], disallow: ["/admin/", "/api/"] },
    ],
    host: new URL(baseUrl).host,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
