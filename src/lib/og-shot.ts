import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Server only. The picture a page's share card shows, as "<kind>/<slug>", when one exists: a
 * component or block still (scripts/capture-og-shots.mjs), a template's hero or a video's poster.
 * Returns undefined when there is none, and the card shows the title on its own.
 */
const FILE: Record<"components" | "blocks" | "templates" | "videos", (slug: string) => string> = {
  components: (s) => `og-shots/components/${s}.jpg`,
  blocks: (s) => `og-shots/blocks/${s}.jpg`,
  templates: (s) => `og-shots/templates/${s}.jpg`,
  videos: (s) => `videos/previews/${s}.jpg`,
};

export function ogShot(kind: keyof typeof FILE, slug: string): string | undefined {
  return existsSync(join(process.cwd(), "public", FILE[kind](slug))) ? `${kind}/${slug}` : undefined;
}
