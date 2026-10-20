/**
 * GET /api/template-shot/<slug>/<n>
 *
 * The sharp screenshot of section n (2 to 4) of a Pro template, for visitors who can open it (Pro,
 * lifetime). These files live in private/template-shots, outside public/, so there is no static URL
 * for them; everyone else sees the blurred stand-in from public/templates/<slug>/locked-<n>.webp.
 *
 * - 404 for an unknown slug or section. Free templates redirect to their public screenshot.
 * - 401 without a session, 403 without access. Fails closed: an auth outage answers 403.
 * - 429 when rate limited. Responses are private (never in a shared cache).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getTemplate } from "@/lib/catalog/templates";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSessionUser, userCanAccessTemplate } from "@/lib/template-access";

export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };
const SLUG = /^[a-z0-9-]{1,64}$/;

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  const limit = rateLimit(`template-shot:${getClientIp(request)}`, 120, 60_000);
  if (!limit.success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });

  const section = Number(n);
  if (!SLUG.test(slug) || !Number.isInteger(section) || section < 2 || section > 4) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
  const tmpl = getTemplate(slug);
  if (!tmpl?.previewImages?.sections[section - 1]) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
  if (!tmpl.premium) return NextResponse.redirect(new URL(tmpl.previewImages.sections[section - 1], request.url));

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE });
  if (!(await userCanAccessTemplate(user.id, tmpl.slug))) {
    return NextResponse.json({ error: "Pro required" }, { status: 403, headers: PRIVATE });
  }

  try {
    const file = path.join(process.cwd(), "private", "template-shots", tmpl.slug, `section-${section}.webp`);
    const body = await readFile(file);
    return new NextResponse(new Uint8Array(body), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
}
