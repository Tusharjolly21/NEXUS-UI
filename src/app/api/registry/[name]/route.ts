/**
 * GET /api/registry/[name]
 *
 * The endpoint the shadcn CLI hits when a user runs:
 *   npx shadcn@latest add @nexus-labs/component-name
 *
 * Flow:
 *  1. Look up the component in the catalog
 *  2. If free → serve the registry JSON immediately (no auth)
 *  3. If premium → verify the Authorization: Bearer nxs_xxx token
 *     → check entitlements in the DB
 *     → 200 with JSON  or  401/403
 *
 * Security properties:
 *  - Token is never logged
 *  - No user data is returned in error responses
 *  - Free components bypass auth entirely (no unnecessary latency)
 *  - Rate limited to prevent abuse
 */

import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getLibraryComponent } from "@/lib/catalog/library-components";
import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { parseApiToken, adminCanAccessComponent } from "@/lib/entitlements";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params;
  const isPublicRegistryAsset = name === "nexus-font";

  // Rate limit: 60 requests per IP per minute (generous for CLI batch installs)
  const ip = getClientIp(_req);
  const rl = rateLimit(`registry:${ip}`, 60, 60_000);
  if (!rl.success) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please wait and try again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.reset / 1000)),
        },
      },
    );
  }

  // ── 1. Resolve component metadata ───────────────────────────────
  const component = getLibraryComponent(name);
  const block = blocksManifest.find((item) => item.registryCliName === name);

  // Unknown package → 404
  if (!component && !block && !isPublicRegistryAsset) {
    return new NextResponse("Component not found", { status: 404 });
  }

  // ── 2. Free components — no auth required ────────────────────────
  if (isPublicRegistryAsset || !(component?.premium ?? block?.premium ?? true)) {
    return serveRegistryFile(name);
  }

  // ── 3. Premium — require and validate token ──────────────────────
  const authHeader = _req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return new NextResponse(
      JSON.stringify({
        error: "Unauthorized",
        message: "Add your API token to components.json. Get it at nexus-ui.com/dashboard/api-key",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Resolve token to user ID
  const userId = parseApiToken(token);

  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid token format" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── 4. Entitlement check (service-role, bypasses RLS) ───────────
  const allowed = await adminCanAccessComponent(userId, component?.slug ?? block!.slug);

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Forbidden",
        message: `'${name}' is a premium component. Upgrade at nexus-ui.com/pricing`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── 5. Serve ─────────────────────────────────────────────────────
  return serveRegistryFile(name);
}

async function serveRegistryFile(name: string): Promise<NextResponse> {
  try {
    const filePath = path.join(process.cwd(), ".generated", "registry", `${name}.json`);
    const contents = await readFile(filePath, "utf-8");

    return new NextResponse(contents, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Allow shadcn CLI (and browsers) to cache for 60 s
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return new NextResponse("Registry file not found", { status: 404 });
  }
}
