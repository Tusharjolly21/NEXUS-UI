import { readFile } from "node:fs/promises";
import path from "node:path";
import { hasBuildPrompt } from "@/lib/catalog/gallery-items";
import { libraryComponents } from "@/lib/catalog/library-components";

/**
 * GET /free-prompts/[slug] — the build prompt of a FREE component, as plain text.
 *
 * Free prompts are public, so there is nothing to check: no session, no rate limit, no licence
 * line. Every free prompt is written out once at build time and served from the cache. Pro prompts
 * are not generated here (dynamicParams = false makes them a 404) and stay behind /api/prompt.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return libraryComponents.filter((c) => !c.premium && hasBuildPrompt(c.slug)).map((c) => ({ slug: c.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = libraryComponents.find((c) => c.slug === slug);
  if (!component || component.premium || !hasBuildPrompt(slug)) return new Response("Not found", { status: 404 });
  try {
    const text = await readFile(path.join(process.cwd(), "content", "build-prompts", `${slug}.md`), "utf8");
    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
