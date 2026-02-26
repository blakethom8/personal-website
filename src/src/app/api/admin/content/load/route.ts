import { NextResponse, type NextRequest } from "next/server";
import {
  AdminContentError,
  assertValidSlug,
  loadPostContent,
} from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rawSlug = req.nextUrl.searchParams.get("slug");

  try {
    const slug = assertValidSlug(rawSlug);
    const content = loadPostContent(slug);
    return NextResponse.json({ slug, content });
  } catch (error) {
    if (error instanceof AdminContentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

