import { NextResponse } from "next/server";
import { getLibraryComponent } from "@/lib/catalog/library-components";
import { sessionCanAccessComponent } from "@/lib/component-access";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/usage/[slug] — the usage example, props and packages of one component, fetched by the
 * gallery inspector when it opens (kept out of the gallery's HTML, which lists ~140 components).
 *
 * Free components are public and cacheable. Pro components return their usage code only to a
 * session with access; everyone else gets the props and packages (they're on the public page
 * anyway) with `locked: true` and no code. Pro responses are never stored by shared caches.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rl = rateLimit(`usage:${getClientIp(req)}`, 120, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { slug } = await params;
  const c = getLibraryComponent(slug);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const base = { props: c.props ?? [], dependencies: c.dependencies, premium: c.premium };
  if (!c.premium) {
    return NextResponse.json(
      { ...base, locked: false, usage: c.reactSource ?? c.previewSections?.[0]?.reactSource ?? "" },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  }

  const allowed = await sessionCanAccessComponent(c.slug, true);
  return NextResponse.json(
    { ...base, locked: !allowed, usage: allowed ? (c.reactSource ?? c.previewSections?.[0]?.reactSource ?? "") : "" },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
