import { NextResponse } from "next/server";
import { allGalleryItems } from "@/lib/catalog/gallery-items";
import { blocks } from "@/lib/catalog/blocks";
import { getPreviewExportName } from "@/lib/catalog/library-components";

/** Development-only list of gallery and block previews for `scripts/measure-tiles.mjs`. */
export function GET() {
  if (process.env.NODE_ENV === "production" && process.env.TILE_LAB !== "1") return new NextResponse("Not found", { status: 404 });
  return NextResponse.json([
    ...allGalleryItems().map((i) => ({ slug: i.slug, exportName: i.exportName, group: i.group, categoryLabel: i.categoryLabel })),
    ...blocks.map((b) => ({ slug: b.slug, exportName: getPreviewExportName(b.Preview), group: "blocks", categoryLabel: b.category })),
  ]);
}
