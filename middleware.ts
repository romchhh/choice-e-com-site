import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64Decode(str: string): string {
  try {
    if (typeof atob !== "undefined") {
      return atob(str);
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let i = 0;
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    return output;
  } catch {
    throw new Error("Invalid base64 string");
  }
}

function applySecurityHeaders(response: NextResponse, pathname: string, request: NextRequest) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");

  if (pathname.startsWith("/images/") || pathname.startsWith("/api/images/")) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("Accept-Ranges", "bytes");
  }

  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    response.headers.set("Vary", "Accept-Encoding");
  }

  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  if (isMobile) {
    response.headers.set("X-Mobile-Optimized", "true");
    response.headers.set("Critical-CH", "Viewport-Width, Device-Memory");
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/mono-webhook")) {
    const response = NextResponse.next();
    response.headers.delete("x-forwarded-host");
    response.headers.delete("origin");
    response.headers.set("Content-Type", "application/json");
    response.headers.set("X-Middleware-Webhook", "true");
    return response;
  }

  // POST to /ru/success → redirect to GET (payment gateway callback)
  if (pathname === "/ru/success" && request.method === "POST") {
    const base =
      process.env.PUBLIC_URL ||
      process.env.NEXT_PUBLIC_PUBLIC_URL ||
      "http://localhost:3000";
    const successUrl = `${base.replace(/\/$/, "")}/ru/success${request.nextUrl.search}`;
    return NextResponse.redirect(successUrl, 303);
  }

  // POST to /success → redirect to GET
  if (pathname === "/success" && request.method === "POST") {
    const base =
      process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
    const successUrl = `${base.replace(/\/$/, "")}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(successUrl, 303);
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, pathname, request);

  const method = request.method;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isOrdersList = pathname === "/api/orders" && method === "GET";
  const isOrderById = /^\/api\/orders\/\d+$/.test(pathname);
  const isImagesUpload = pathname.startsWith("/api/images") && method === "POST";
  const isMigrateOrCleanup = pathname === "/api/migrate" || pathname === "/api/cleanup";
  const isSensitiveApi =
    isAdminApi || isOrdersList || isOrderById || isImagesUpload || isMigrateOrCleanup;

  if (!isAdminPage && !isSensitiveApi) {
    return response;
  }

  if (pathname.startsWith("/api/auth/")) {
    return response;
  }

  const authCookie = request.cookies.get("admin_auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const token = authCookie.value;
      const decoded = base64Decode(token);
      const [user, password] = decoded.split(":");

      const validUser = process.env.ADMIN_USER;
      const validPass = process.env.ADMIN_PASS;

      if (user === validUser && password === validPass) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("[Middleware] Auth error:", e);
    }
  }

  if (isSensitiveApi) {
    if (!isAuthenticated) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return response;
  }

  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (pathname === "/admin/login") {
    return response;
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/mono-webhook",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
