/**
 * POST /mcp — the Nexus UI Model Context Protocol server (Streamable HTTP, stateless).
 *
 * It lets an AI coding tool (Claude Code, Cursor, Windsurf and the like) search the catalog, read an item's details
 * and install command, and fetch a component's source and a free component's build prompt, without the person leaving
 * their editor.
 *
 * Nothing here decides who may read what. Pro source is fetched by calling the site's own /api/registry route with
 * the caller's Authorization header, so the same API-key check, entitlement check, rate limit and licence stamp that
 * guard `npx shadcn add` guard this too. A Pro build prompt is not served here at all (that route needs a browser
 * session). The server stores nothing and logs no tokens.
 */
import { NextResponse } from "next/server";
import { buildSearchIndex, type SearchEntry } from "@/lib/catalog/search-index";
import { getLibraryComponent } from "@/lib/catalog/library-components";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SERVER_INFO = { name: "nexus-ui", version: "1.0.0" };
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];
const SITE = "https://www.nexus-ui.com";
const SCOPE = "@nexus-labs";

type Json = Record<string, unknown>;
type RpcRequest = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Json };

const TOOLS = [
  {
    name: "search_nexus",
    description:
      "Search Nexus UI: animated React components, blocks (page sections), templates (whole landing pages), videos and animated icons. Returns names, what each is, whether it is free or Pro, its page, and the id to pass to get_nexus_item.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What you are looking for, e.g. \"pricing section\", \"drag slider with sound\", \"fintech landing page\"." },
        kind: { type: "string", enum: ["component", "block", "template", "video", "icon"], description: "Only this kind of item." },
        free_only: { type: "boolean", description: "Only free items." },
        limit: { type: "number", description: "How many to return (1 to 20, default 8)." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_nexus_item",
    description: "Details of one catalog item by id (from search_nexus): description, tags, free or Pro, page link and, for components and blocks, the shadcn install command.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "An id such as \"component:molten-hold\" or \"template:ferry\"." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "get_component_source",
    description:
      "The source files of a component or block, ready to write into a project. Free items work without a key. Pro items need the person's Nexus UI API key sent as an Authorization Bearer header in this server's configuration; without it the answer says how to get one.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "The component or block slug, e.g. \"wheel-selector\" or \"pricing-section\"." } },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "get_build_prompt",
    description:
      "The build prompt of a free component: the brief an AI agent follows to recreate it from scratch. Pro build prompts are only on the component's page for signed-in Pro members.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "The component slug." } },
      required: ["slug"],
      additionalProperties: false,
    },
  },
] as const;

let index: SearchEntry[] | null = null;
const catalog = () => (index ??= buildSearchIndex());

const text = (value: string, isError = false) => ({ content: [{ type: "text", text: value }], ...(isError ? { isError: true } : {}) });

function installCommand(kind: string, slug: string): string | null {
  if (kind === "component") {
    const c = getLibraryComponent(slug);
    return c ? `npx shadcn@latest add ${SCOPE}/${c.registryCliName ?? c.slug}` : null;
  }
  if (kind === "block") {
    const b = blocksManifest.find((x) => x.slug === slug);
    return b ? `npx shadcn@latest add ${SCOPE}/${b.registryCliName ?? b.slug}` : null;
  }
  return null;
}

function describe(e: SearchEntry) {
  const slug = e.id.slice(e.id.indexOf(":") + 1);
  return {
    id: e.id,
    kind: e.kind,
    name: e.title,
    category: e.subtitle,
    description: e.description,
    access: e.premium ? "Pro" : "Free",
    page: `${SITE}${e.href}`,
    tags: e.tags,
    install: installCommand(e.kind, slug),
  };
}

function search(args: Json) {
  const query = String(args.query ?? "").toLowerCase().trim();
  const words = query.split(/\s+/).filter(Boolean);
  const kind = typeof args.kind === "string" ? args.kind : null;
  const limit = Math.min(20, Math.max(1, Number(args.limit) || 8));
  const rows = catalog()
    .filter((e) => (!kind || e.kind === kind) && (args.free_only !== true || !e.premium))
    .map((e) => {
      const hay = `${e.title} ${e.subtitle} ${e.description} ${e.tags.join(" ")} ${e.keywords}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      const inTitle = words.filter((w) => e.title.toLowerCase().includes(w)).length;
      return { e, rank: words.length ? hits * 10 + inTitle * 6 + e.score / 100 : e.score / 100, hits };
    })
    .filter((r) => !words.length || r.hits > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit)
    .map((r) => describe(r.e));
  return text(rows.length ? JSON.stringify(rows, null, 2) : "No matches. Try fewer or different words, or drop the kind filter.");
}

function item(args: Json) {
  const e = catalog().find((x) => x.id === args.id);
  return e ? text(JSON.stringify(describe(e), null, 2)) : text("Unknown id. Use an id returned by search_nexus.", true);
}

const SLUG = /^[a-z0-9-]{1,80}$/;

async function source(origin: string, auth: string | null, ip: string, args: Json) {
  const slug = String(args.slug ?? "");
  if (!SLUG.test(slug)) return text("Give a component or block slug such as \"wheel-selector\".", true);
  const c = getLibraryComponent(slug);
  const b = c ? null : blocksManifest.find((x) => x.slug === slug || x.registryCliName === slug);
  const registryName = c ? (c.registryCliName ?? c.slug) : b ? (b.registryCliName ?? b.slug) : null;
  if (!registryName) return text("No component or block with that slug. Use search_nexus to find one.", true);

  const res = await fetch(new URL(`/api/registry/${registryName}`, origin), {
    headers: { ...(auth ? { authorization: auth } : {}), ...(ip ? { "x-forwarded-for": ip } : {}) },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    return text(
      `${c?.name ?? b?.name ?? slug} is part of Nexus UI Pro. Create an API key at ${SITE}/dashboard/api-key and add it to this server's configuration as an Authorization Bearer header (see ${SITE}/docs/mcp). Plans: ${SITE}/pricing.`,
      true,
    );
  }
  if (res.status === 429) return text("Too many requests. Wait a minute and try again.", true);
  if (!res.ok) return text("The source could not be read right now.", true);

  const data = (await res.json()) as { files?: { path?: string; target?: string; content?: string }[]; dependencies?: string[]; registryDependencies?: string[] };
  const files = (data.files ?? []).map((f) => `// ${f.target ?? f.path}\n${f.content ?? ""}`).join("\n\n");
  const header = [
    `${c?.name ?? b?.name ?? slug}: write each file below at the path in its first comment.`,
    data.dependencies?.length ? `npm dependencies: ${data.dependencies.join(", ")}` : null,
    data.registryDependencies?.length ? `Other registry items it needs: ${data.registryDependencies.map((d) => d.split("/").pop()).join(", ")}` : null,
    `Or install it with: npx shadcn@latest add ${SCOPE}/${registryName}`,
  ]
    .filter(Boolean)
    .join("\n");
  return text(`${header}\n\n${files}`);
}

async function prompt(origin: string, ip: string, args: Json) {
  const slug = String(args.slug ?? "");
  if (!SLUG.test(slug)) return text("Give a component slug such as \"wheel-selector\".", true);
  const res = await fetch(new URL(`/api/prompt/${slug}`, origin), {
    headers: ip ? { "x-forwarded-for": ip } : {},
    cache: "no-store",
  });
  if (res.status === 429) return text("Too many requests. Wait a minute and try again.", true);
  if (res.status === 403) return text(`That build prompt is part of Nexus UI Pro. Signed-in Pro members can copy it from ${SITE}/components/${slug}.`, true);
  if (!res.ok) return text("No build prompt for that slug.", true);
  const data = (await res.json()) as { name?: string; prompt?: string };
  return text(data.prompt ?? "No build prompt for that slug.");
}

async function callTool(req: Request, name: string, args: Json) {
  const origin = new URL(req.url).origin;
  const auth = req.headers.get("authorization");
  // The internal calls below are rate limited per client IP; pass the caller's IP on so every MCP user
  // does not share the one bucket of this server's own address.
  const ip = getClientIp(req);
  switch (name) {
    case "search_nexus":
      return search(args);
    case "get_nexus_item":
      return item(args);
    case "get_component_source":
      return source(origin, auth, ip, args);
    case "get_build_prompt":
      return prompt(origin, ip, args);
    default:
      return null;
  }
}

const ok = (id: RpcRequest["id"], result: unknown) => ({ jsonrpc: "2.0", id: id ?? null, result });
const fail = (id: RpcRequest["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

async function handle(req: Request, msg: RpcRequest) {
  const id = msg.id;
  // A notification has no id and gets no answer.
  if (id === undefined) return null;
  switch (msg.method) {
    case "initialize": {
      const asked = typeof msg.params?.protocolVersion === "string" ? msg.params.protocolVersion : "";
      return ok(id, {
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions:
          "Search with search_nexus, read details with get_nexus_item, then get_component_source for the code. Free items need no key; Pro items need the person's Nexus UI API key as an Authorization Bearer header.",
      });
    }
    case "ping":
      return ok(id, {});
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const name = typeof msg.params?.name === "string" ? msg.params.name : "";
      const args = (msg.params?.arguments && typeof msg.params.arguments === "object" ? msg.params.arguments : {}) as Json;
      const result = await callTool(req, name, args);
      return result ? ok(id, result) : fail(id, -32602, `Unknown tool: ${name}`);
    }
    default:
      return fail(id, -32601, "Method not found");
  }
}

const HEADERS = { "Cache-Control": "private, no-store" };

export async function POST(req: Request) {
  const rl = rateLimit(`mcp:${getClientIp(req)}`, 120, 60_000);
  if (!rl.success) return NextResponse.json(fail(null, -32000, "Too many requests"), { status: 429, headers: { ...HEADERS, "Retry-After": String(Math.ceil(rl.reset / 1000)) } });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail(null, -32700, "Parse error"), { status: 400, headers: HEADERS });
  }
  const batch = Array.isArray(body);
  const messages = (batch ? body : [body]) as RpcRequest[];
  if (!messages.length || messages.length > 20 || messages.some((m) => !m || typeof m !== "object" || m.jsonrpc !== "2.0")) {
    return NextResponse.json(fail(null, -32600, "Invalid request"), { status: 400, headers: HEADERS });
  }
  const replies = (await Promise.all(messages.map((m) => handle(req, m)))).filter((r) => r !== null);
  if (!replies.length) return new NextResponse(null, { status: 202, headers: HEADERS });
  return NextResponse.json(batch ? replies : replies[0], { headers: HEADERS });
}

/** This server answers each request on its own; it has no long-lived stream to offer. */
export function GET() {
  return new NextResponse("Nexus UI MCP server. Send JSON-RPC with POST. Setup: " + SITE + "/docs/mcp", { status: 405, headers: { ...HEADERS, Allow: "POST" } });
}
