import { NextResponse } from "next/server";
import { getLibraryComponent, libraryComponents } from "@/lib/catalog/library-components";

/**
 * GET /api/usage/[slug] — the usage example, props and packages of one component, fetched by the
 * gallery inspector when it opens (kept out of the gallery's HTML, which lists ~100 components).
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return libraryComponents.map((c) => ({ slug: c.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getLibraryComponent(slug);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    usage: c.reactSource ?? c.previewSections?.[0]?.reactSource ?? "",
    props: c.props ?? [],
    dependencies: c.dependencies,
    premium: c.premium,
  });
}
