import { readFile } from "node:fs/promises";
import { withLicense } from "@/lib/license-stamp";
import path from "node:path";
import { NextResponse } from "next/server";
import { getTemplate } from "@/lib/catalog/templates";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSessionUser, sessionCanAccessTemplate } from "@/lib/template-access";
import { templatePromptPath } from "@/lib/template-sources";

/**
 * GET /api/prompt/template/[slug] — the build prompt for one template: the brief an AI coding
 * agent needs to rebuild it from scratch. Comes with the template (Pro, lifetime or a purchase of
 * that template).
 *
 * - Only a signed-in session with access gets the text; everyone else gets 401/403 and no content.
 * - The slug is checked against the catalog before any file is touched, and the path is built from
 *   the catalog's slug, so it can't be used to read other files.
 * - The prompts live in content/build-prompts/templates, outside public/, so nothing serves them
 *   statically.
 * - Responses are private and never stored by shared caches. Rate limited per IP.
 */
export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const rl = rateLimit(`prompt-template:${getClientIp(req)}`, 30, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });

  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });

  if (!(await sessionCanAccessTemplate(tmpl.slug))) {
    const signedIn = !!(await getSessionUser());
    return NextResponse.json(
      signedIn
        ? { error: "Pro required", message: "Build prompts come with Pro. Upgrade at nexus-ui.com/pricing" }
        : { error: "Unauthorized", message: "Sign in with Pro to copy the build prompt." },
      { status: signedIn ? 403 : 401, headers: PRIVATE },
    );
  }

  const file = templatePromptPath(tmpl.slug);
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });

  try {
    const prompt = withLicense(await readFile(path.join(process.cwd(), file), "utf8"), (await getSessionUser())?.id, tmpl.slug);
    return NextResponse.json({ name: tmpl.title, prompt }, { headers: PRIVATE });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
}
