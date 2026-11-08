import { readFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { libraryComponents, getLibraryComponent, type LibraryComponent } from "@/lib/catalog/library-components";
import { COMPONENT_CATEGORIES, getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { adminCanAccessComponent, resolveApiToken } from "@/lib/entitlements";
import { stampRegistryItem } from "@/lib/license-stamp";
import { installCommand, registryAddCommand } from "@/lib/registry-config";
import { getProTeaser } from "@/lib/registry-teaser";
import { siteConfig } from "@/lib/seo";

/**
 * The Nexus UI MCP server: lets a coding agent (Claude Code, Cursor, Codex...) search the library and pull a
 * component into a project by name.
 *
 * Access mirrors the shadcn registry exactly: free components need nothing; Pro source needs an API key from
 * nexus-ui.com/dashboard/api-key, sent as `Authorization: Bearer nxs_...`, on an account with Pro. The key is
 * only resolved when a Pro component's source is actually asked for, it is never logged, and Pro files are
 * stamped with the account they were issued to, the same as a CLI install.
 */

type Item = LibraryComponent;

const SITE = siteConfig.url.replace(/\/$/, "");
const pageUrl = (c: Item) => `${SITE}/components/${c.slug}`;
const registryName = (c: Item) => c.registryCliName ?? c.slug;

// Words people use for the same thing, so "spinner" finds loaders and "nav" finds navbars.
const SYNONYMS: Record<string, string[]> = {
  loader: ["loading", "spinner", "loaders"],
  spinner: ["loader", "loading"],
  nav: ["navbar", "navigation", "menu"],
  navbar: ["nav", "navigation", "header"],
  modal: ["dialog", "popup"],
  button: ["btn", "cta"],
  bg: ["background"],
  background: ["backdrop", "bg"],
  input: ["field", "form"],
  "3d": ["three", "tilt", "depth"],
  card: ["cards", "tile"],
  login: ["signin", "sign-in", "auth"],
  signup: ["register", "sign-up", "auth"],
};

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w));
}

function score(c: Item, terms: string[]): number {
  const nameWords = words(c.name);
  const tagWords = c.tags.flatMap(words);
  const catWords = words(getComponentCategoryLabel(c.categorySlug));
  const kindWords = c.animationKinds.flatMap((k) => words(String(k)));
  const descWords = new Set(words(c.description));
  // Whole words only, so "loader" finds Loaders and not Uploader; a long enough start of a word counts too ("magnet" finds Magnetic).
  const hit = (list: string[], v: string) => list.some((w) => w === v || (v.length >= 4 && w.startsWith(v)));
  let s = 0;
  for (const t of terms) {
    const variants = [t, ...(SYNONYMS[t] ?? []).flatMap(words)];
    let best = 0;
    for (const v of variants) {
      const w = v === t ? 1 : 0.6;
      if (hit(nameWords, v)) best = Math.max(best, 10 * w);
      else if (hit(catWords, v)) best = Math.max(best, 8 * w);
      else if (hit(tagWords, v)) best = Math.max(best, 5 * w);
      else if (hit(kindWords, v)) best = Math.max(best, 3 * w);
      else if (descWords.has(v)) best = Math.max(best, 2 * w);
    }
    s += best;
  }
  return s;
}

function summary(c: Item) {
  return [
    `- ${c.name} (${c.premium ? "Pro" : "Free"})`,
    `  slug: ${c.slug} · category: ${getComponentCategoryLabel(c.categorySlug)}`,
    `  ${c.description.replace(/\s+/g, " ").trim()}`,
    `  ${pageUrl(c)}`,
  ].join("\n");
}

type RegistryFile = { path?: string; target?: string; content?: string };
type RegistryItem = { dependencies?: string[]; files?: RegistryFile[] };

async function readRegistry(name: string, licensedTo?: string): Promise<RegistryItem | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), ".generated", "registry", `${name}.json`), "utf8");
    return JSON.parse(licensedTo ? stampRegistryItem(raw, licensedTo, name) : raw) as RegistryItem;
  } catch {
    return null;
  }
}

function lang(file: string) {
  const ext = file.split(".").pop() ?? "";
  return ({ tsx: "tsx", ts: "ts", css: "css", json: "json", js: "js", jsx: "jsx" } as Record<string, string>)[ext] ?? "";
}

function setupText(c: Item) {
  return [
    "## Install",
    "In a Next.js project with Tailwind CSS and the @/ alias, once per project:",
    "```bash",
    "npx shadcn@latest init -d",
    registryAddCommand(),
    "```",
    c.premium
      ? `Pro items also need NEXUS_API_KEY in .env.local and the "registries" entry with the Authorization header in components.json (steps: ${SITE}/docs/installation). Then:`
      : "Then:",
    "```bash",
    installCommand(registryName(c)),
    "```",
    "Or create the files below by hand at the paths given (relative to the src/ folder).",
  ].join("\n");
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

export function createNexusMcpServer({ token }: { token: string | null }) {
  // The key is checked once per request, and only if a Pro component's source is asked for.
  let access: Promise<{ userId: string | null; problem: string | null }> | null = null;
  const resolveAccess = () =>
    (access ??= (async () => {
      if (!token) return { userId: null, problem: "no-key" };
      const r = await resolveApiToken(token);
      if (r.status === "legacy") return { userId: null, problem: "This API key format has been retired. Create a new key at nexus-ui.com/dashboard/api-key." };
      if (r.status !== "valid") return { userId: null, problem: "This API key was not recognised. Create a new one at nexus-ui.com/dashboard/api-key." };
      return { userId: r.userId, problem: null };
    })());

  const server = new McpServer(
    { name: "nexus-ui", version: "1.0.0" },
    {
      instructions:
        "Nexus UI is a library of animated React components for Next.js (Tailwind CSS, Framer Motion, TypeScript). " +
        "Use search_components to find one, then get_component to get its files, packages and install command. " +
        "Free components work without a key. Pro components return their source only when the connection sends a Nexus UI API key of an account with Pro.",
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search Nexus UI components",
      description:
        "Find Nexus UI components by what they are or do, e.g. 'pricing section', 'magnetic button', 'loader', 'drag to reorder'. Returns names, slugs, Free/Pro and a one-line description.",
      inputSchema: {
        query: z.string().max(200).describe("What you are looking for, in plain words."),
        category: z.string().max(60).optional().describe("Optional category slug from list_categories, e.g. 'hero-sections'."),
        free_only: z.boolean().optional().describe("Only free components."),
        limit: z.number().int().min(1).max(20).optional().describe("How many results (default 8)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, category, free_only, limit }) => {
      const terms = words(query);
      const pool = libraryComponents.filter(
        (c) => (!category || c.categorySlug === category) && (!free_only || !c.premium),
      );
      const ranked = terms.length
        ? pool.map((c) => ({ c, s: score(c, terms) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.c.trendingScore - a.c.trendingScore)
        : pool.map((c) => ({ c, s: 0 })).sort((a, b) => b.c.trendingScore - a.c.trendingScore);
      const hits = ranked.slice(0, limit ?? 8).map((x) => x.c);
      if (!hits.length) return text(`No components match "${query}". Try other words, or list_categories to browse.`);
      return text(`${hits.length} of ${ranked.length} match${ranked.length === 1 ? "es" : ""}:\n\n${hits.map(summary).join("\n\n")}\n\nUse get_component with a slug for the files and install command.`);
    },
  );

  server.registerTool(
    "list_categories",
    {
      title: "List Nexus UI categories",
      description: "The component categories with how many free and Pro components each has.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const rows = COMPONENT_CATEGORIES.map((cat) => {
        const items = libraryComponents.filter((c) => c.categorySlug === cat.slug);
        const free = items.filter((c) => !c.premium).length;
        return items.length ? `- ${cat.label} (slug: ${cat.slug}): ${items.length} component${items.length === 1 ? "" : "s"}, ${free} free` : null;
      }).filter(Boolean);
      return text(`${libraryComponents.length} components in ${rows.length} categories:\n\n${rows.join("\n")}`);
    },
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a Nexus UI component",
      description:
        "Everything needed to add one component to a project: the install command, the npm packages, and the source files with the paths they go to. Free components always include the source; Pro components include it when the connection's API key belongs to an account with Pro.",
      inputSchema: {
        slug: z.string().min(1).max(80).describe("The component's slug from search_components, e.g. 'glow-button'."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ slug }) => {
      const c = getLibraryComponent(slug.trim().toLowerCase());
      if (!c) return { ...text(`There is no component called "${slug}". Use search_components to find the right slug.`), isError: true };

      const head = [
        `# ${c.name} (${c.premium ? "Pro" : "Free"})`,
        c.description.replace(/\s+/g, " ").trim(),
        `Page with a live preview: ${pageUrl(c)}`,
      ];

      let licensedTo: string | undefined;
      if (c.premium) {
        const a = await resolveAccess();
        const allowed = a.userId ? await adminCanAccessComponent(a.userId, c.slug) : false;
        if (!allowed) {
          const teaser = await getProTeaser(registryName(c));
          const why =
            a.problem === "no-key"
              ? `This connection has no API key. If you have Pro, create one at ${SITE}/dashboard/api-key and add it to the MCP connection as an "Authorization: Bearer <key>" header (setup: ${SITE}/mcp).`
              : a.problem ?? `The account behind this API key does not have Pro. Plans: ${SITE}/pricing.`;
          return text(
            [
              ...head,
              teaser ? `\nHow it works: ${teaser}` : "",
              `\n${c.name} is a Pro component, so its source comes with Nexus UI Pro. ${why}`,
              `Free components need no key: search_components with free_only: true lists them.`,
            ].filter(Boolean).join("\n"),
          );
        }
        licensedTo = a.userId!;
      }

      const reg = await readRegistry(registryName(c), licensedTo);
      const deps = reg?.dependencies?.length ? reg.dependencies : c.dependencies;
      const files = (reg?.files ?? []).filter((f) => typeof f.content === "string");
      const body = [
        ...head,
        "",
        setupText(c),
        "",
        `## npm packages\n${deps.length ? deps.join(" ") : "none beyond React"}`,
        files.length ? `\n## Files (${files.length})` : `\n## Files\nThe file list is not available right now; use the install command above.`,
        ...files.map((f) => {
          const target = f.target ?? f.path ?? "file";
          return `\n### ${target}\n\`\`\`${lang(target)}\n${f.content!.trimEnd()}\n\`\`\``;
        }),
        c.reactSource ? `\n## Example usage\n\`\`\`tsx\n${c.reactSource.trimEnd()}\n\`\`\`` : "",
      ];
      return text(body.filter((x) => x !== "").join("\n"));
    },
  );

  return server;
}
