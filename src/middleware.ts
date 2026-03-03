import { NextResponse, type NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? (isProduction ? "" : "dev-admin-token");

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  if (isProduction && !ADMIN_TOKEN) {
    return pathname.startsWith("/api/admin")
      ? NextResponse.json({ error: "Admin auth is not configured" }, { status: 503 })
      : new NextResponse("Admin auth is not configured", { status: 503 });
  }

  const token = req.cookies.get("admin_token")?.value;

  if (token !== ADMIN_TOKEN) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
