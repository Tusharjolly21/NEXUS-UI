import { libraryComponents } from "@/lib/catalog/library-components";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

/** One line of plain text per component: the whole library in a form an AI tool can read in a single request. */
export function GET() {
  const free = libraryComponents.filter((c) => !c.premium);
  const pro = libraryComponents.filter((c) => c.premium);
  const line = (c: (typeof libraryComponents)[number]) =>
    `- [${c.name}](${siteConfig.url}/components/${c.slug}): ${c.description.replace(/\s+/g, " ").trim()}`;

  const body = [
    "# Nexus UI: every component",
    "",
    `> ${libraryComponents.length} animated React components for Next.js, built with Tailwind CSS and Framer Motion. ${free.length} are free with full source; ${pro.length} are Pro (you can preview them, the source and install come with Pro). Install any of them with the shadcn CLI: npx shadcn@latest add @nexus-labs/<slug>. Overview: ${siteConfig.url}/llms.txt`,
    "",
    `## Free components (${free.length})`,
    "",
    ...free.map(line),
    "",
    `## Pro components (${pro.length})`,
    "",
    ...pro.map(line),
    "",
  ].join("\n");

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
