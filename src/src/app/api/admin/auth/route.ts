import { NextResponse, type NextRequest } from "next/server";

const isProduction = process.env.NODE_ENV === "production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? (isProduction ? "" : "admin123");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? (isProduction ? "" : "dev-admin-token");

export async function POST(req: NextRequest) {
  let body: { password?: unknown };

  if (isProduction && (!ADMIN_PASSWORD || !ADMIN_TOKEN)) {
    return NextResponse.json(
      { error: "Admin auth is not configured" },
      { status: 503 },
    );
  }

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (typeof body.password !== "string" || body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
