import { readFile } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { libraryComponents, getLibraryComponent, type LibraryComponent } from "@/lib/catalog/library-components";
import { COMPONENT_CATEGORIES, getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { blockVariants, variantAnchor } from "@/lib/catalog/block-variants";
import { templates, type MarketplaceTemplate } from "@/lib/catalog/templates";
import { adminCanAccessComponent, resolveApiToken } from "@/lib/entitlements";
import { stampRegistryItem } from "@/lib/license-stamp";
import { installCommand, registryAddCommand } from "@/lib/registry-config";
import { getProTeaser } from "@/lib/registry-teaser";
import { PUBLIC_SITE } from "@/lib/mcp/config";
import { looksLikeJwt, resolveOAuthToken, type OAuthTokenResolution } from "@/lib/mcp/oauth";

/**
 * The Nexus UI MCP server: lets a coding agent (Claude Code, Cursor, Codex...) search the library and pull a
 * component into a project by name.
 *
 * Access mirrors the shadcn registry exactly: free components and blocks need nothing; Pro source needs an account
 * with Pro, proven either by an API key from nexus-ui.com/dashboard/api-key sent as `Authorization: Bearer nxs_...`,
 * or, in Claude's apps, by the Supabase access token Claude gets when the user signs in (lib/mcp/oauth.ts). The
 * credential is only resolved when Pro source is actually asked for, it is never logged, and Pro files are stamped
 * with the account they were issued to, the same as a CLI install.
 */

type Item = LibraryComponent;

const SITE = PUBLIC_SITE;
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

/** One installable block: a whole block package, or a single section of a block page. */
type BlockItem = {
  /** Install (registry) name, what get_block takes. */
  name: string;
  title: string;
  /** The block page's name (e.g. "Pricing Section") and its section type. */
  blockName: string;
  category: string;
  description: string;
  premium: boolean;
  /** What the entitlement check is about: the block's slug, or the section's id. */
  entitlementSlug: string;
  page: string;
  tags: string[];
  example?: string;
};

const BLOCK_ITEMS: BlockItem[] = (() => {
  const byBlock = new Map(blocksManifest.map((b) => [b.slug, b]));
  const items: BlockItem[] = [];
  const seen = new Set<string>();
  // Single sections first (Motion Kit sections and the ones moved over from the library), since they are what people
  // usually want. A section is Pro unless marked free, whatever the block it sits in (the registry route's rule).
  for (const v of blockVariants) {
    if (!v.registryCliName || seen.has(v.registryCliName)) continue;
    const b = byBlock.get(v.block);
    seen.add(v.registryCliName);
    const kind = b ? b.category.replace(/ (blocks|sections)$/i, "").toLowerCase() : "page";
    items.push({
      name: v.registryCliName,
      title: v.title,
      blockName: b?.name ?? v.block,
      category: b?.category ?? "Blocks",
      description: `A ${kind} section from the ${b?.name ?? v.block} block. ${b?.description ?? ""}`.trim(),
      premium: v.premium !== false,
      entitlementSlug: v.id,
      page: `${SITE}/blocks/${v.block}#${variantAnchor(v.title)}`,
      tags: b?.tags ?? [],
      example: v.usage,
    });
  }
  // Whole blocks that install as one package with all their layouts.
  for (const b of blocksManifest) {
    if (!b.registryCliName || seen.has(b.registryCliName)) continue;
    seen.add(b.registryCliName);
    items.push({
      name: b.registryCliName,
      title: b.variants.length > 1 ? `${b.name} (all ${b.variants.length} layouts)` : b.name,
      blockName: b.name,
      category: b.category,
      description: b.description,
      premium: b.premium,
      entitlementSlug: b.slug,
      page: `${SITE}/blocks/${b.slug}`,
      tags: b.tags,
      example: b.reactSource,
    });
  }
  return items;
})();

const getBlockItem = (name: string) => BLOCK_ITEMS.find((b) => b.name === name.trim().toLowerCase()) ?? null;

function blockScore(b: BlockItem, terms: string[]): number {
  const titleWords = words(`${b.title} ${b.blockName}`);
  const catWords = words(b.category);
  const tagWords = b.tags.flatMap(words);
  const descWords = new Set(words(b.description));
  const hit = (list: string[], v: string) => list.some((w) => w === v || (v.length >= 4 && w.startsWith(v)));
  let s = 0;
  for (const t of terms) {
    let best = 0;
    for (const v of [t, ...(SYNONYMS[t] ?? []).flatMap(words)]) {
      const w = v === t ? 1 : 0.6;
      if (hit(titleWords, v)) best = Math.max(best, 10 * w);
      else if (hit(catWords, v)) best = Math.max(best, 8 * w);
      else if (hit(tagWords, v)) best = Math.max(best, 5 * w);
      else if (descWords.has(v)) best = Math.max(best, 2 * w);
    }
    s += best;
  }
  return s;
}

function blockSummary(b: BlockItem) {
  return [
    `- ${b.title} (${b.premium ? "Pro" : "Free"})`,
    `  name: ${b.name} · ${b.category}`,
    `  ${b.description.replace(/\s+/g, " ").trim()}`,
    `  ${b.page}`,
  ].join("\n");
}

function templateScore(t: MarketplaceTemplate, terms: string[]): number {
  const titleWords = words(t.title);
  const catWords = words(t.category);
  const tagWords = t.tags.flatMap(words);
  const descWords = new Set(words(`${t.description} ${t.sections.join(" ")}`));
  const hit = (list: string[], v: string) => list.some((w) => w === v || (v.length >= 4 && w.startsWith(v)));
  let s = 0;
  for (const term of terms) {
    let best = 0;
    for (const v of [term, ...(SYNONYMS[term] ?? []).flatMap(words)]) {
      const w = v === term ? 1 : 0.6;
      if (hit(titleWords, v)) best = Math.max(best, 10 * w);
      else if (hit(catWords, v)) best = Math.max(best, 8 * w);
      else if (hit(tagWords, v)) best = Math.max(best, 5 * w);
      else if (descWords.has(v)) best = Math.max(best, 2 * w);
    }
    s += best;
  }
  return s;
}

function templateSummary(t: MarketplaceTemplate) {
  const [name] = t.title.split(" — ");
  return [
    `- ${name} (${t.premium ? "Pro" : "Free"}) · ${t.category}`,
    `  ${t.description.replace(/\s+/g, " ").trim()}`,
    `  Pages: ${t.pages.join(", ")} · Sections: ${t.sections.join(", ")}`,
    t.features.length ? `  Highlights: ${t.features.slice(0, 3).join("; ")}` : "",
    `  Live preview: ${SITE}/live-preview/template/${t.slug} · Details and download: ${SITE}/templates/${t.slug}`,
  ].filter(Boolean).join("\n");
}

/** True when a tool call asks for the source of a Pro item: the only thing that needs an account. */
export function asksForProItem(tool: unknown, args: Record<string, unknown> | undefined): boolean {
  if (tool === "get_component" && typeof args?.slug === "string") return !!getLibraryComponent(args.slug.trim().toLowerCase())?.premium;
  if (tool === "get_block" && typeof args?.name === "string") return !!getBlockItem(args.name)?.premium;
  return false;
}

/** What deliver() needs to send one component or block. */
type Deliverable = {
  title: string;
  kind: "component" | "block";
  tool: "get_component" | "get_block";
  premium: boolean;
  /** What the entitlement check is about (a component slug, a block slug, or a section id). */
  entitlementSlug: string;
  /** Registry (install) name. */
  registry: string;
  description: string;
  page: string;
  fallbackDeps: string[];
  example?: string;
  /** How to list the free ones, for the Pro teaser. */
  freeHint: string;
};

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

function setupText(registry: string, premium: boolean) {
  return [
    "## Install",
    "In a Next.js project with Tailwind CSS and the @/ alias, once per project:",
    "```bash",
    "npx shadcn@latest init -d",
    registryAddCommand(),
    "```",
    premium
      ? `Pro items also need NEXUS_API_KEY in .env.local and the "registries" entry with the Authorization header in components.json (steps: ${SITE}/docs/installation). Then:`
      : "Then:",
    "```bash",
    installCommand(registry),
    "```",
    "Or create the files below by hand at the paths given (relative to the src/ folder).",
  ].join("\n");
}

/** Characters of source per answer: comfortably under the ~25,000-token cap agents apply to one tool result. */
const ANSWER_BUDGET = 60_000;

/** A file cut at line ends into pieces that each fit in one answer. Joined in order they give the file back exactly. */
function splitForAnswers(content: string): string[] {
  if (content.length <= ANSWER_BUDGET) return [content];
  const parts: string[] = [];
  let current = "";
  for (const line of content.match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    if (current && current.length + line.length > ANSWER_BUDGET) {
      parts.push(current);
      current = "";
    }
    current += line;
  }
  if (current) parts.push(current);
  return parts;
}

const KEY_CHECK_FAILED = "The API key could not be checked just now. Try again in a minute.";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

export function createNexusMcpServer({ token, oauth }: { token: string | null; oauth?: OAuthTokenResolution }) {
  // The credential is checked once per request, and only if Pro source is asked for.
  let access: Promise<{ userId: string | null; problem: string | null }> | null = null;
  const resolveAccess = () =>
    (access ??= (async () => {
      if (!token) return { userId: null, problem: "no-key" };
      // A sign-in token from Claude's apps (the route may already have checked it).
      if (looksLikeJwt(token)) {
        const r = oauth ?? (await resolveOAuthToken(token));
        if (r.status === "valid") return { userId: r.userId, problem: null };
        if (r.status === "error") return { userId: null, problem: "Your sign-in could not be checked just now. Try again in a minute." };
        return { userId: null, problem: "Your Nexus UI sign-in has expired. Reconnect Nexus UI in your app's connector settings and sign in again." };
      }
      let r: Awaited<ReturnType<typeof resolveApiToken>>;
      try {
        r = await resolveApiToken(token);
      } catch {
        // The database could not be reached: say so plainly, never pass the internal error on.
        return { userId: null, problem: KEY_CHECK_FAILED };
      }
      if (r.status === "legacy") return { userId: null, problem: "This API key format has been retired. Create a new key at nexus-ui.com/dashboard/api-key." };
      if (r.status !== "valid") return { userId: null, problem: "This API key was not recognised. Create a new one at nexus-ui.com/dashboard/api-key." };
      return { userId: r.userId, problem: null };
    })());

  /** Sends one registry item (a component or a block): its setup, packages and files, or the Pro teaser. */
  async function deliver(d: Deliverable, file?: string, part?: number) {
    const head = [
      `# ${d.title} (${d.premium ? "Pro" : "Free"})`,
      d.description.replace(/\s+/g, " ").trim(),
      `Page with a live preview: ${d.page}`,
    ];

    let licensedTo: string | undefined;
    if (d.premium) {
      const a = await resolveAccess();
      let allowed = false;
      let problem = a.problem;
      if (a.userId) {
        try {
          allowed = await adminCanAccessComponent(a.userId, d.entitlementSlug);
        } catch {
          problem = KEY_CHECK_FAILED;
        }
      }
      if (!allowed) {
        const teaser = await getProTeaser(d.registry);
        const why =
          problem === "no-key"
            ? `This connection has no API key. If you have Pro, create one at ${SITE}/dashboard/api-key and add it to the MCP connection as an "Authorization: Bearer <key>" header (setup: ${SITE}/mcp).`
            : problem ?? `The Nexus UI account this connection uses does not have Pro. Plans: ${SITE}/pricing.`;
        return text(
          [
            ...head,
            teaser ? `\nHow it works: ${teaser}` : "",
            `\n${d.title} is a Pro ${d.kind}, so its source comes with Nexus UI Pro. ${why}`,
            `Free ${d.kind}s need no key: ${d.freeHint}.`,
          ].filter(Boolean).join("\n"),
        );
      }
      licensedTo = a.userId!;
    }

    const reg = await readRegistry(d.registry, licensedTo);
    const deps = reg?.dependencies?.length ? reg.dependencies : d.fallbackDeps;
    const files = (reg?.files ?? []).filter((f) => typeof f.content === "string");
    const pathOf = (f: RegistryFile) => f.target ?? f.path ?? "file";
    const block = (f: RegistryFile) => `\n### ${pathOf(f)}\n\`\`\`${lang(pathOf(f))}\n${f.content!.trimEnd()}\n\`\`\``;

    // One file on its own, for components too big to send in one answer.
    if (file) {
      const want = file.trim().replace(/^\.?\//, "").replace(/^src\//, "");
      const f = files.find((x) => pathOf(x) === want || pathOf(x).endsWith(`/${want}`));
      if (!f) return { ...text(`${d.title} has no file "${file}". Its files: ${files.map(pathOf).join(", ") || "none listed"}.`), isError: true };
      const parts = splitForAnswers(f.content!);
      const n = part ?? 1;
      if (n > parts.length) return { ...text(`${pathOf(f)} has ${parts.length} part${parts.length === 1 ? "" : "s"}.`), isError: true };
      if (parts.length === 1) return text(`# ${d.title}: ${pathOf(f)}${block(f)}`);
      const next = n < parts.length ? `Get the rest with part: ${n + 1}, then join the parts in order, with nothing between them, to make the file.` : "That was the last part: join all the parts in order, with nothing between them, to make the file.";
      return text(`# ${d.title}: ${pathOf(f)}, part ${n} of ${parts.length}\n${next}\n\n\`\`\`${lang(pathOf(f))}\n${parts[n - 1]}${parts[n - 1].endsWith("\n") ? "" : "\n"}\`\`\``);
    }

    // Agents cap how much one tool answer may hold (Claude Code's default is about 25,000 tokens), so a large
    // component sends what fits and lists the rest to fetch one by one.
    const sent: RegistryFile[] = [];
    const held: RegistryFile[] = [];
    let used = 0;
    for (const f of files) {
      const size = f.content!.length + 200;
      if (used + size <= ANSWER_BUDGET) {
        sent.push(f);
        used += size;
      } else held.push(f);
    }
    const body = [
      ...head,
      "",
      setupText(d.registry, d.premium),
      "",
      `## npm packages\n${deps.length ? deps.join(" ") : "none beyond React"}`,
      files.length ? `\n## Files (${files.length})` : `\n## Files\nThe file list is not available right now; use the install command above.`,
      held.length
        ? `This ${d.kind} is large, so ${sent.length} of its ${files.length} files are below. Get each of the others with ${d.tool} and its path in "file": ${held
            .map((f) => {
              const n = splitForAnswers(f.content!).length;
              return n > 1 ? `${pathOf(f)} (in ${n} parts: pass part 1 to ${n})` : pathOf(f);
            })
            .join(", ")}. Or run the install command, which adds them all.`
        : "",
      ...sent.map(block),
      d.example && !held.length ? `\n## Example usage\n\`\`\`tsx\n${d.example.trimEnd()}\n\`\`\`` : "",
    ];
    return text(body.filter((x) => x !== "").join("\n"));
  }

  const server = new McpServer(
    { name: "nexus-ui", version: "1.0.0" },
    {
      instructions:
        "Nexus UI is a library of animated React components and page-section blocks for Next.js (Tailwind CSS, Framer Motion, TypeScript). " +
        "Use search_components or search_blocks to find one, then get_component or get_block to get its files, packages and install command; search_templates finds complete site templates. " +
        "Free items work without an account. Pro items return their source only for a connection signed in to, or using the API key of, a Nexus UI account with Pro.",
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
        file: z
          .string()
          .max(200)
          .optional()
          .describe("Only this file, by its path as listed in an earlier answer. Large components send some files this way."),
        part: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("With file: which part of a very long file (1, 2, ...). The answer says how many parts there are."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ slug, file, part }) => {
      const c = getLibraryComponent(slug.trim().toLowerCase());
      if (!c) return { ...text(`There is no component called "${slug}". Use search_components to find the right slug.`), isError: true };
      return deliver(
        {
          title: c.name,
          kind: "component",
          tool: "get_component",
          premium: c.premium,
          entitlementSlug: c.slug,
          registry: registryName(c),
          description: c.description,
          page: pageUrl(c),
          fallbackDeps: c.dependencies,
          example: c.reactSource,
          freeHint: "search_components with free_only: true lists them",
        },
        file,
        part,
      );
    },
  );

  server.registerTool(
    "search_blocks",
    {
      title: "Search Nexus UI blocks",
      description:
        "Find Nexus UI blocks: whole page sections such as heroes, pricing, testimonials, FAQs, calls to action, footers, sign-up and 404 pages. " +
        "Returns names, install names, Free/Pro, the section type and a link to the live preview.",
      inputSchema: {
        query: z.string().max(200).describe("What you are looking for, in plain words, e.g. 'pricing', 'waitlist', 'footer'."),
        free_only: z.boolean().optional().describe("Only free blocks."),
        limit: z.number().int().min(1).max(20).optional().describe("How many results (default 8)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, free_only, limit }) => {
      const terms = words(query);
      const pool = BLOCK_ITEMS.filter((b) => !free_only || !b.premium);
      const ranked = terms.length
        ? pool.map((b) => ({ b, s: blockScore(b, terms) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)
        : pool.map((b) => ({ b, s: 0 }));
      const hits = ranked.slice(0, limit ?? 8).map((x) => x.b);
      if (!hits.length) return text(`No blocks match "${query}". Try a section type such as hero, pricing, testimonials, FAQ, CTA, footer or sign-up.`);
      return text(`${hits.length} of ${ranked.length} match${ranked.length === 1 ? "es" : ""}:\n\n${hits.map(blockSummary).join("\n\n")}\n\nUse get_block with a name for the files and install command.`);
    },
  );

  server.registerTool(
    "get_block",
    {
      title: "Get a Nexus UI block",
      description:
        "Everything needed to add one block (a page section) to a project: the install command, the npm packages, and the source files with the paths they go to. Free blocks always include the source; Pro blocks include it when the connection belongs to an account with Pro.",
      inputSchema: {
        name: z.string().min(1).max(80).describe("The block's install name from search_blocks, e.g. 'pricing-section'."),
        file: z.string().max(200).optional().describe("Only this file, by its path as listed in an earlier answer. Large blocks send some files this way."),
        part: z.number().int().min(1).max(50).optional().describe("With file: which part of a very long file (1, 2, ...). The answer says how many parts there are."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ name, file, part }) => {
      const b = getBlockItem(name);
      if (!b) return { ...text(`There is no block called "${name}". Use search_blocks to find the right name.`), isError: true };
      return deliver(
        {
          title: b.title,
          kind: "block",
          tool: "get_block",
          premium: b.premium,
          entitlementSlug: b.entitlementSlug,
          registry: b.name,
          description: b.description,
          page: b.page,
          fallbackDeps: [],
          example: b.example,
          freeHint: "search_blocks with free_only: true lists them",
        },
        file,
        part,
      );
    },
  );

  server.registerTool(
    "search_templates",
    {
      title: "Search Nexus UI templates",
      description:
        "Find Nexus UI website templates: complete animated sites such as SaaS, portfolio, agency, fintech and creator landing pages. " +
        "Returns each template's name, Free/Pro, pages, sections, main features and links to its live preview and download page.",
      inputSchema: {
        query: z.string().max(200).describe("What kind of site, in plain words, e.g. 'saas landing page', 'portfolio', 'crypto'."),
        limit: z.number().int().min(1).max(10).optional().describe("How many results (default 5)."),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => {
      const terms = words(query);
      const ranked = templates
        .map((t) => ({ t, s: terms.length ? templateScore(t, terms) : 1 }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || b.t.trendingScore - a.t.trendingScore);
      const hits = ranked.slice(0, limit ?? 5).map((x) => x.t);
      if (!hits.length) return text(`No templates match "${query}". Try a kind of site such as SaaS, portfolio, agency, fintech or blog.`);
      return text(
        `${hits.length} of ${ranked.length} match${ranked.length === 1 ? "es" : ""}:\n\n${hits.map(templateSummary).join("\n\n")}\n\n` +
          `Templates download as a complete Next.js project from their page (Pro templates with a Pro plan). ` +
          `To build from parts instead, search_blocks finds the same kinds of sections.`,
      );
    },
  );

  return server;
}
