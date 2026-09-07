import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const hits = await globalSearch(q);
  return NextResponse.json({ count: hits.length, hits });
}
