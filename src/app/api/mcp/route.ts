/**
 * POST /api/mcp — the Nexus UI MCP server (Streamable HTTP, stateless, JSON responses).
 *
 * Connect it from Claude Code, Cursor, Codex or any MCP client at https://www.nexus-ui.com/api/mcp.
 * Free components need nothing. For Pro source, the client sends the account's API key as
 * `Authorization: Bearer nxs_...` (never in the URL, so it stays out of logs and browser history).
 * Setup for each app: /mcp.
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createNexusMcpServer } from "@/lib/mcp/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "private, no-store" };

async function handle(req: Request): Promise<Response> {
  const rl = rateLimit(`mcp:${getClientIp(req)}`, 60, 60_000);
  if (!rl.success) {
    return Response.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Too many requests. Wait a minute and try again." }, id: null },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() || null : null;

  // Stateless: one server and transport per request, no sessions to keep between calls.
  const server = createNexusMcpServer({ token });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    const res = await transport.handleRequest(req);
    const headers = new Headers(res.headers);
    headers.set("Cache-Control", "private, no-store");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  } finally {
    // The JSON body is fully built before handleRequest returns, so closing here cuts nothing off.
    void server.close();
  }
}

export async function POST(req: Request) {
  return handle(req);
}

/** A browser opening the address gets a short note; this server has no event stream to open. */
export async function GET(req: Request) {
  if ((req.headers.get("accept") ?? "").includes("text/event-stream")) {
    return new Response("This MCP server is stateless and does not open an event stream.", { status: 405, headers: { ...NO_STORE, Allow: "POST" } });
  }
  return Response.json(
    {
      name: "Nexus UI MCP server",
      transport: "streamable-http",
      url: `${siteConfig.url.replace(/\/$/, "")}/api/mcp`,
      tools: ["search_components", "list_categories", "get_component"],
      setup: `${siteConfig.url.replace(/\/$/, "")}/mcp`,
    },
    { headers: NO_STORE },
  );
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: "POST, GET" } });
}
