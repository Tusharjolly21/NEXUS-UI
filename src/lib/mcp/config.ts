import { getSiteUrl } from "@/lib/env";

/**
 * The public address of the site and of the MCP server. People copy these into their editors, so they must
 * never be a local address: a build without NEXT_PUBLIC_SITE_URL (local dev, a misconfigured preview)
 * falls back to the production domain instead of localhost.
 */
const configured = getSiteUrl();
export const PUBLIC_SITE = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(configured) ? "https://www.nexus-ui.com" : configured;
export const MCP_URL = `${PUBLIC_SITE}/api/mcp`;
