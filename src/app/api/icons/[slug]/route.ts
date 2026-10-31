import { readFile } from "node:fs/promises";
import path from "node:path";
import { getIcon } from "@/lib/icons/catalog";

/** An icon's own source file, as plain text: what the Copy button on each icon puts on the clipboard. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) return new Response("Not found", { status: 404 });
  const source = await readFile(path.join(process.cwd(), "src/components/nx-icons/icons", `${icon.slug}.tsx`), "utf8");
  return new Response(source, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
