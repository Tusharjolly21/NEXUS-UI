import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/catalog/search-index";

/**
 * GET /api/search-index — the catalog rows behind the search palette (names, descriptions, tags,
 * links). Public catalog data only, the same text the pages already show; no source code, no
 * session. Prerendered at build time so the CDN serves it.
 */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
