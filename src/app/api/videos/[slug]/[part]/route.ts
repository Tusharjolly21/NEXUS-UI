import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSessionUser, sessionHasPro } from "@/lib/component-access";
import { licenseComment, withLicense } from "@/lib/license-stamp";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { VIDEO_PARTS, getVideo, type VideoPart } from "@/lib/catalog/videos";
import { buildVideoPrompt } from "@/lib/video-prompt";

/**
 * GET /api/videos/[slug]/[part] — what comes with a video: its build prompt (instructions plus the
 * real files), its React source, the shared kit, the frame page and the render script. The two free videos are open to everyone; the
 * rest need Pro (a live plan or All-Access).
 *
 * - Only the catalogue's own slugs and the fixed part names reach the file system, so the path
 *   can't be steered to another file.
 * - The files live in content/videos, outside public/, so nothing serves them statically.
 * - Pro files carry the licence line for the signed-in account. Responses are private.
 */
export const dynamic = "force-dynamic";

const PRIVATE = { "Cache-Control": "private, no-store" };

const FILES: Record<VideoPart, (slug: string) => string> = {
  prompt: (s) => `content/videos/${s}/prompt.md`,
  source: (s) => `content/videos/${s}/source.tsx`,
  kit: () => "content/videos/kit.ts",
  parts: () => "content/videos/parts.tsx",
  frame: () => "content/videos/frame.tsx",
  render: () => "content/videos/render.mjs",
};

export async function GET(req: Request, { params }: { params: Promise<{ slug: string; part: string }> }) {
  const rl = rateLimit(`videos:${getClientIp(req)}`, 60, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });

  const { slug, part } = await params;
  const video = getVideo(slug);
  if (!video || !(VIDEO_PARTS as readonly string[]).includes(part)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
  const kind = part as VideoPart;
  if (kind === "parts" && !video.parts) return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });

  const user = await getSessionUser();
  if (video.premium && !(await sessionHasPro())) {
    return NextResponse.json(
      user
        ? { error: "Pro required", message: "This video's files come with Pro. Upgrade at nexus-ui.com/pricing" }
        : { error: "Unauthorized", message: "Sign in with Pro to get this video's files." },
      { status: user ? 403 : 401, headers: PRIVATE },
    );
  }

  try {
    // The prompt is built from the video's real files (so it always matches them); the rest are served as they are.
    let text = kind === "prompt" ? await buildVideoPrompt(video) : await readFile(path.join(process.cwd(), FILES[kind](slug)), "utf8");
    if (video.premium && user) {
      text = kind === "prompt" ? withLicense(text, user.id, `video ${slug}`) : licenseComment(user.id, `video ${slug}`) + text;
    }
    return NextResponse.json(kind === "prompt" ? { name: video.title, prompt: text } : { name: video.title, text }, { headers: PRIVATE });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: PRIVATE });
  }
}
