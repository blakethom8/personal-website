import { NextResponse, type NextRequest } from "next/server";
import { buildWebMCPManifest } from "@/lib/webmcp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "unknown";
  return NextResponse.json(buildWebMCPManifest(slug));
}

