/**
 * POST /api/mcp — the Nexus UI MCP server (Streamable HTTP, stateless, JSON responses).
 *
 * Connect it from Claude Code, Cursor, Codex or any MCP client at https://www.nexus-ui.com/api/mcp.
 * Free components need nothing. For Pro source, the client sends either the account's API key as
 * `Authorization: Bearer nxs_...` (never in the URL, so it stays out of logs and browser history), or, in
 * Claude's apps, a Supabase access token from signing in (see lib/mcp/oauth.ts). Setup for each app: /mcp.
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { asksForProItem, createNexusMcpServer } from "@/lib/mcp/server";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { MCP_URL, PUBLIC_SITE } from "@/lib/mcp/config";
import { isMcpOAuthEnabled, looksLikeJwt, resolveOAuthToken, signInRequired, type OAuthTokenResolution } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "private, no-store" };

/** True when a JSON-RPC message (or batch) asks for the source of a Pro item, the only thing that needs an account. */
function asksForProSource(body: unknown): boolean {
  const messages = Array.isArray(body) ? body : [body];
  return messages.some((msg) => {
    if (!msg || typeof msg !== "object") return false;
    const { method, params } = msg as { method?: unknown; params?: { name?: unknown; arguments?: Record<string, unknown> } };
    return method === "tools/call" && asksForProItem(params?.name, params?.arguments);
  });
}

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

  // Read the body once: the sign-in gate looks at it, then the MCP transport gets an identical copy.
  const raw = req.method === "POST" ? await req.text() : "";
  let oauth: OAuthTokenResolution | undefined;
  if (isMcpOAuthEnabled() && raw) {
    let body: unknown = null;
    try {
      body = JSON.parse(raw);
    } catch {
      /* not JSON: the transport answers with a parse error */
    }
    // Claude starts sign-in only on an HTTP 401, so the gate runs before the MCP SDK (a tool can only answer 200).
    // API keys are left to the tools, which explain a wrong or missing key the same way as before.
    if (asksForProSource(body) && (!token || looksLikeJwt(token))) {
      if (!token) return signInRequired("Sign in to Nexus UI to get Pro components and blocks");
      oauth = await resolveOAuthToken(token);
      if (oauth.status === "invalid") return signInRequired("Your Nexus UI sign-in has expired. Sign in again");
    }
  }

  // Stateless: one server and transport per request, no sessions to keep between calls.
  const server = createNexusMcpServer({ token, oauth });
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    const res = await transport.handleRequest(
      raw ? new Request(req.url, { method: req.method, headers: req.headers, body: raw }) : req,
    );
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
      url: MCP_URL,
      tools: ["search_components", "list_categories", "get_component", "search_blocks", "get_block", "search_templates"],
      setup: `${PUBLIC_SITE}/mcp`,
    },
    { headers: NO_STORE },
  );
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { ...NO_STORE, Allow: "POST, GET" } });
}
