/**
 * GET /api/download/template?slug=<slug>
 *
 * Streams a template's source as a standalone Next.js project (see src/lib/template-zip.ts).
 *
 * - 400 without a slug, 404 for an unknown slug or one without source.
 * - 401 without a signed-in session, 403 without access to a Pro template (a plan, lifetime or a
 *   purchase of that template). Checked here on every request; the UI lock is only the visible half.
 * - 429 when rate limited: per IP before auth, per user after.
 * - Responses are private, no-store, so no shared cache keeps a zip. Error bodies never include
 *   paths, stack traces or user data.
 */

import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getTemplate } from "@/lib/catalog/templates";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSessionUser, userCanAccessTemplate } from "@/lib/template-access";
import { getTemplateSource } from "@/lib/template-sources";
import { TemplateZipError, createTemplateZip } from "@/lib/template-zip";

export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

function tooMany(reset: number, message: string) {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { ...PRIVATE, "Retry-After": String(Math.max(1, Math.ceil(reset / 1000))) } },
  );
}

export async function GET(request: NextRequest) {
  const ipLimit = rateLimit(`download-ip:${getClientIp(request)}`, 30, 60_000);
  if (!ipLimit.success) return tooMany(ipLimit.reset, "Too many requests. Please wait and try again.");

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400, headers: PRIVATE });

  const tmpl = getTemplate(slug);
  if (!tmpl) return NextResponse.json({ error: "Template not found" }, { status: 404, headers: PRIVATE });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE });

  const userLimit = rateLimit(`download:${user.id}`, 10, 60_000);
  if (!userLimit.success) return tooMany(userLimit.reset, "Too many download requests. Please wait before trying again.");

  if (tmpl.premium && !(await userCanAccessTemplate(user.id, tmpl.slug))) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403, headers: PRIVATE });
  }

  if (!getTemplateSource(tmpl.slug)) {
    return NextResponse.json({ error: "Template source not available" }, { status: 404, headers: PRIVATE });
  }

  let zip: Awaited<ReturnType<typeof createTemplateZip>>["zip"];
  try {
    ({ zip } = await createTemplateZip(tmpl.slug));
  } catch (error) {
    // Server log only: project-relative paths, no user data.
    console.error(`[download/template] ${tmpl.slug}:`, error instanceof TemplateZipError ? error.message : "unexpected error");
    return NextResponse.json({ error: "Template source not available" }, { status: 500, headers: PRIVATE });
  }

  // Streamed: media-heavy templates exceed buffered function response limits in production.
  const nodeStream = zip.generateNodeStream({
    type: "nodebuffer",
    streamFiles: true,
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  }) as unknown as Readable;
  const body = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
  const filename = `${tmpl.slug.replace(/[^a-z0-9-]/gi, "") || "template"}.zip`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      ...PRIVATE,
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
