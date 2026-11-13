/**
 * Protected resource metadata (RFC 9728) for the MCP server at /api/mcp: tells Claude which authorization server
 * (Supabase Auth) issues the tokens it accepts. Claude fetches it after the MCP route answers 401.
 * The path-suffixed copy at ./api/mcp is the one clients try first.
 */
import { isMcpOAuthEnabled, protectedResourceMetadata } from "@/lib/mcp/oauth";

export const dynamic = "force-dynamic";

export function GET() {
  if (!isMcpOAuthEnabled()) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json(protectedResourceMetadata(), {
    headers: { "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" },
  });
}
