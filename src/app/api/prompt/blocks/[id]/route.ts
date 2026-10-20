import { readFile } from "node:fs/promises";
import { withLicense } from "@/lib/license-stamp";
import { getSessionUser } from "@/lib/component-access";
import path from "node:path";
import { NextResponse } from "next/server";
import { blockVariants } from "@/lib/catalog/block-variants";
import { sessionCanAccessComponent } from "@/lib/component-access";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/prompt/blocks/[id] — the build prompt for one block section (a Pro feature for every
 * section, free or not). Same rules as /api/prompt/[slug]:
 *
 * - Only a session with Pro (or a purchase of that block) gets the text; everyone else 401/403.
 * - The id is matched against the catalog before any file is read, so it can't reach other files.
 * - Prompts live in content/build-prompts/blocks, outside public/. Private, no-store, rate limited.
 */
export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const rl = rateLimit(`prompt:${getClientIp(req)}`, 30, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });

  const { id } = await params;
  const section = blockVariants.find((v) => v.id === id);
  if (!section) return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });

  // Motion Kit sections are bought as themselves; the rest come with their block.
  const entitlement = section.premium ? section.id : section.block;
  if (!(await sessionCanAccessComponent(entitlement, true))) {
    return NextResponse.json(
      { error: "Pro required", message: "Build prompts come with Pro. Upgrade at nexus-ui.com/pricing" },
      { status: 403, headers: PRIVATE },
    );
  }

  try {
    const file = path.join(process.cwd(), "content", "build-prompts", "blocks", `${section.id}.md`);
    const prompt = withLicense(await readFile(file, "utf8"), (await getSessionUser())?.id, section.id);
    return NextResponse.json({ name: section.title, prompt }, { headers: PRIVATE });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
}
