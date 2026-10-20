import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { isSessionValid } from "@/lib/auth-store";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const PUBLIC_PATHS = new Set([
  "/admin/login",
  "/admin/reset-password",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/forgot-password",
  "/api/admin/reset-password",
]);

const UNAVAILABLE = "השרת אינו זמין כרגע, נסי שוב בעוד רגע";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) {
    const response = NextResponse.next();
    // The reset token is in this page's URL: keep it out of Referer headers.
    // A response header applies before any subresource loads, unlike a
    // streamed <meta> tag.
    if (pathname === "/admin/reset-password") {
      response.headers.set("Referrer-Policy", "no-referrer");
    }
    return response;
  }

  let valid: boolean;
  try {
    // Checks the session version against the DB (Proxy runs on the Node.js
    // runtime in Next 16, so Prisma works here).
    valid = await isSessionValid(request.cookies.get(SESSION_COOKIE)?.value);
  } catch (err) {
    console.error("Session check failed:", err);
    return pathname.startsWith("/api/")
      ? NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
      : new NextResponse(UNAVAILABLE, {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
  }

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "לא מחובר/ת" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
