import { NextResponse, type NextRequest } from "next/server";
import {
  AdminContentError,
  assertValidSlug,
  savePostContent,
} from "@/lib/admin-content";

interface SaveRequestBody {
  slug?: unknown;
  content?: unknown;
}

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: SaveRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
  }

  try {
    const slug = assertValidSlug(body.slug);
    savePostContent(slug, body.content);
    return NextResponse.json({
      success: true,
      slug,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AdminContentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

