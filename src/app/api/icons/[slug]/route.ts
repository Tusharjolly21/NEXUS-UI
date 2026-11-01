import { readFile } from "node:fs/promises";
import path from "node:path";
import { getIcon } from "@/lib/icons/catalog";
import { sessionCanAccessIcon } from "@/lib/icons/access";
import { getSessionUser } from "@/lib/component-access";
import { licenseComment } from "@/lib/license-stamp";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/icons/[slug] — an icon's own source file as plain text: what the Copy button and
 * `curl https://www.nexus-ui.com/api/icons/bell -o bell.tsx` give you.
 *
 * - The 75 free icons: anyone, cached at the edge.
 * - A Pro icon: only a signed-in session with Pro. Everyone else gets 403 and no code. The licensed copy carries
 *   a short licence line naming the account it was issued to, like every other Pro file.
 * - The slug is checked against the catalog before any file is read, so it cannot be used to read other files.
 */
const PRIVATE = { "cache-control": "private, no-store" };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) return new Response("Not found", { status: 404, headers: PRIVATE });

  if (icon.premium) {
    const rl = rateLimit(`icon:${getClientIp(request)}`, 60, 60_000);
    if (!rl.success) return Response.json({ error: "Too many requests" }, { status: 429, headers: PRIVATE });
    if (!(await sessionCanAccessIcon(icon.slug))) {
      return Response.json(
        { error: "Pro required", message: `The ${icon.title} icon is part of Nexus UI Pro. See plans at nexus-ui.com/pricing` },
        { status: 403, headers: PRIVATE },
      );
    }
  }

  const source = await readFile(path.join(process.cwd(), "src/components/nx-icons/icons", `${icon.slug}.tsx`), "utf8");
  const user = icon.premium ? await getSessionUser() : null;
  // Comments may precede "use client", so the licence line goes on top of the file.
  const body = user ? licenseComment(user.id, `${icon.slug} icon`) + source : source;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      ...(icon.premium ? PRIVATE : { "cache-control": "public, max-age=3600, s-maxage=86400" }),
    },
  });
}
