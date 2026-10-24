import { readFile } from "node:fs/promises";
import { withLicense } from "@/lib/license-stamp";
import { getSessionUser } from "@/lib/component-access";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLibraryComponent } from "@/lib/catalog/library-components";
import { hasBuildPrompt } from "@/lib/catalog/gallery-items";
import { sessionCanAccessComponent } from "@/lib/component-access";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { variantPrompt } from "@/lib/build-prompts";

/**
 * GET /api/prompt/[slug] — the build prompt for one component: the exact brief an AI coding agent
 * needs to recreate it from scratch. Free for free components; Pro components' prompts need Pro.
 *
 * - Free components: anyone gets the text. Pro components: only a signed-in session with Pro (or a
 *   purchase of this component); everyone else gets 403 and no content.
 * - The slug is checked against the catalog before any file is touched, so it can't be used to
 *   read other files.
 * - The prompts live in content/build-prompts, outside public/, so nothing serves them statically.
 * - `?variant=<id>` returns just that variant's brief (pages with several variants keep one brief
 *   per variant in the same file). The id must match `[a-z0-9-]` and a marker in the file.
 * - Responses are private and never stored by shared caches. Rate limited per IP.
 */
export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rl = rateLimit(`prompt:${getClientIp(req)}`, 30, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });

  const { slug } = await params;
  const component = getLibraryComponent(slug);
  if (!component || !hasBuildPrompt(component.slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }

  // A free component's prompt is free; a Pro component's prompt needs Pro (or a purchase of it).
  if (!(await sessionCanAccessComponent(component.slug, component.premium))) {
    return NextResponse.json(
      { error: "Pro required", message: "This build prompt is part of Nexus UI Pro. See plans at nexus-ui.com/pricing" },
      { status: 403, headers: PRIVATE },
    );
  }

  const variant = new URL(req.url).searchParams.get("variant");
  if (variant !== null) {
    const text = /^[a-z0-9-]{1,80}$/.test(variant) ? await variantPrompt(component.slug, variant) : null;
    if (!text) return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
    const prompt = component.premium ? withLicense(text, (await getSessionUser())?.id, component.slug) : text;
    return NextResponse.json({ name: component.name, prompt }, { headers: PRIVATE });
  }

  try {
    const file = path.join(process.cwd(), "content", "build-prompts", `${component.slug}.md`);
    const body = await readFile(file, "utf8");
    // Only Pro prompts carry the licence line; a free component's prompt is free and unmarked.
    const prompt = component.premium ? withLicense(body, (await getSessionUser())?.id, component.slug) : body;
    return NextResponse.json({ name: component.name, prompt }, { headers: PRIVATE });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
}
