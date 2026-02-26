import { NextResponse } from "next/server";
import { AdminContentError, listPostSlugs } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ posts: listPostSlugs() });
  } catch (error) {
    if (error instanceof AdminContentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

