/**
 * Sign-in for the MCP server through Supabase Auth's OAuth 2.1 server, so Claude (claude.ai, Desktop, mobile)
 * can get a Pro member's source without an API key.
 *
 * How it fits together:
 * - Free tools and free components work with no sign-in at all.
 * - When a call needs Pro source and carries no valid credential, the route answers HTTP 401 with a
 *   `WWW-Authenticate` header pointing at our protected resource metadata (/.well-known/oauth-protected-resource).
 *   Claude reads it, finds Supabase as the authorization server, signs the user in on /oauth/consent, and retries
 *   the same call with a Supabase access token.
 * - API keys (`nxs_...`) keep working exactly as before, for Claude Code, Cursor and the shadcn CLI.
 *
 * The whole flow is off until MCP_OAUTH_ENABLED=1, which should only be set once the OAuth server is switched on
 * in the Supabase dashboard. Until then a call without a key gets the old answer (a teaser and how to get a key).
 */
import { getAdminClient } from "@/lib/supabase/admin";
import { MCP_URL, PUBLIC_SITE } from "@/lib/mcp/config";

export const isMcpOAuthEnabled = () => process.env.MCP_OAUTH_ENABLED === "1" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Supabase Auth's issuer: `https://<project-ref>.supabase.co/auth/v1`. */
export function authIssuer(): string {
  return `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/auth/v1`;
}

/** Where Claude reads our protected resource metadata (RFC 9728), path-suffixed for the /api/mcp endpoint. */
export const RESOURCE_METADATA_URL = `${PUBLIC_SITE}/.well-known/oauth-protected-resource/api/mcp`;

export function protectedResourceMetadata() {
  return {
    // Must equal the URL people add in Claude, exactly.
    resource: MCP_URL,
    authorization_servers: [authIssuer()],
    bearer_methods_supported: ["header"],
    resource_name: "Nexus UI",
    resource_documentation: `${PUBLIC_SITE}/mcp`,
  };
}

/** The 401 that makes Claude show its Connect card, sign the user in, and retry the call. */
export function signInRequired(description: string): Response {
  const challenge =
    `Bearer error="invalid_token", error_description="${description.replace(/"/g, "'")}", ` +
    `resource_metadata="${RESOURCE_METADATA_URL}"`;
  return Response.json(
    { error: "invalid_token", error_description: description },
    { status: 401, headers: { "WWW-Authenticate": challenge, "Cache-Control": "private, no-store" } },
  );
}

/** A Supabase access token is a JWT (three dot-separated parts); our API keys start with nxs_. */
export const looksLikeJwt = (token: string) => /^[\w-]+\.[\w-]+\.[\w-]+$/.test(token);

export type OAuthTokenResolution = { status: "valid"; userId: string } | { status: "invalid" } | { status: "error" };

/**
 * Checks a Supabase access token with Supabase itself, which also catches revoked and expired sessions.
 * The token is never logged.
 */
export async function resolveOAuthToken(token: string): Promise<OAuthTokenResolution> {
  if (!looksLikeJwt(token)) return { status: "invalid" };
  try {
    const { data, error } = await getAdminClient().auth.getUser(token);
    if (error) {
      // 4xx from Supabase: the token is bad or expired. 5xx or a network failure: we could not check it.
      const status = (error as { status?: number }).status ?? 0;
      return status >= 400 && status < 500 ? { status: "invalid" } : { status: "error" };
    }
    return data.user ? { status: "valid", userId: data.user.id } : { status: "invalid" };
  } catch {
    return { status: "error" };
  }
}
