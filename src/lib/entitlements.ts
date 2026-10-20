/**
 * entitlements.ts — SERVER ONLY
 *
 * Two responsibilities:
 *  1. Issue and resolve nxs_xxx API tokens (only a hash is stored)
 *  2. Check whether a user is allowed to access a given resource
 *
 * Access hierarchy (first match wins):
 *  - Lifetime order  → can access everything, forever
 *  - Active subscription → can access everything while active
 *  - Per-item order  → can access that specific component or template
 */

import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

// ── API tokens ────────────────────────────────────────────────────────────────

const TOKEN_PREFIX = "nxs_";

/** New tokens: nxs_ + 32 random bytes as base64url (43 chars). */
const TOKEN_PATTERN = /^nxs_[A-Za-z0-9_-]{43}$/;

/** Retired tokens derived from the user UUID: nxs_ + 32 hex chars. */
const LEGACY_TOKEN_PATTERN = /^nxs_[0-9a-f]{32}$/;

/**
 * SHA-256 is enough here: tokens carry 256 bits of randomness, so there is
 * nothing to brute-force and no need for a slow password hash.
 */
export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new random API token, stores only its hash, and returns the
 * plaintext. Replaces any existing token for the user, which revokes it.
 * The caller must have verified that `userId` is the signed-in user.
 */
export async function issueApiToken(userId: string): Promise<string> {
  const token = `${TOKEN_PREFIX}${randomBytes(32).toString("base64url")}`;

  const admin = getAdminClient();
  const { error } = await admin.from("api_tokens").upsert(
    {
      user_id: userId,
      token_hash: hashApiToken(token),
      token_hint: token.slice(-4),
      created_at: new Date().toISOString(),
      last_used_at: null,
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error("Failed to store API token");
  return token;
}

/**
 * Display metadata for the user's current token. Never includes the token.
 */
export async function getApiTokenInfo(userId: string) {
  const admin = getAdminClient();
  const { data } = await admin
    .from("api_tokens")
    .select("token_hint, created_at, last_used_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export type ApiTokenResolution =
  | { status: "valid"; userId: string }
  | { status: "legacy" }
  | { status: "invalid" };

/**
 * Resolves a Bearer token to its owner by hash lookup.
 * Uses the service role — the caller has no Supabase session.
 */
export async function resolveApiToken(token: string): Promise<ApiTokenResolution> {
  if (LEGACY_TOKEN_PATTERN.test(token)) return { status: "legacy" };
  if (!TOKEN_PATTERN.test(token)) return { status: "invalid" };

  const admin = getAdminClient();
  const tokenHash = hashApiToken(token);
  const { data } = await admin
    .from("api_tokens")
    .select("user_id")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!data) return { status: "invalid" };

  // Best effort — a failed timestamp update must not block the install
  await admin
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash);

  return { status: "valid", userId: data.user_id };
}

// ── Entitlement checks ────────────────────────────────────────────────────────

/**
 * Returns true if the user has an active subscription (annual plan).
 * Uses admin client to bypass RLS — safe because userId comes from verified session.
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .limit(1)
    .maybeSingle();
  return data !== null;
}

/**
 * Returns true if the user has a lifetime order (one-time full access).
 * Uses admin client to bypass RLS — safe because userId comes from verified session.
 */
async function hasLifetimeAccess(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_type", "lifetime")
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return data !== null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Can this user download/access a given component slug?
 *
 * Only the two plans unlock Pro items: Pro (an active yearly subscription) or All-Access (a
 * lifetime order). Nothing is sold on its own, so the slug doesn't change the answer; it stays in
 * the signature so callers say what they're asking about.
 */
export async function canAccessComponent(
  userId: string,
  slug: string,
): Promise<boolean> {
  if (await hasLifetimeAccess(userId)) return true;
  if (await hasActiveSubscription(userId)) return true;
  void slug;
  return false;
}

/**
 * Can this user download/access a given template slug?
 */
export async function canAccessTemplate(
  userId: string,
  slug: string,
): Promise<boolean> {
  if (await hasLifetimeAccess(userId)) return true;
  if (await hasActiveSubscription(userId)) return true;
  void slug;
  return false;
}


/**
 * Broad check: does this user have ANY premium access?
 * Used to show/hide upgrade banners.
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const [lifetime, subscription] = await Promise.all([
    hasLifetimeAccess(userId),
    hasActiveSubscription(userId),
  ]);
  return lifetime || subscription;
}

// ── Admin entitlement checks (bypass RLS — for API token auth) ────────────────

/**
 * These variants use the service-role key and bypass RLS.
 * Use ONLY in server-side API routes where the caller authenticates
 * via an API token (not a browser session), so no auth.uid() is present.
 */

async function adminHasLifetimeAccess(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_type", "lifetime")
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return data !== null;
}

async function adminHasActiveSubscription(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["active", "past_due"])
    .limit(1)
    .maybeSingle();
  return data !== null;
}

async function adminHasPurchasedComponent(userId: string, slug: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_type", "component")
    .eq("product_slug", slug)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return data !== null;
}

/**
 * Entitlement check for API-token-authenticated requests (shadcn CLI).
 * Uses service role key — bypasses RLS.
 */
export async function adminCanAccessComponent(userId: string, slug: string): Promise<boolean> {
  if (await adminHasLifetimeAccess(userId)) return true;
  if (await adminHasActiveSubscription(userId)) return true;
  if (await adminHasPurchasedComponent(userId, slug)) return true;
  return false;
}

/**
 * Full entitlements summary for the billing dashboard.
 */
export async function getUserEntitlements(userId: string) {
  const supabase = await createClient();

  const [subResult, ordersResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const subscription: Subscription | null = (subResult.data as Subscription | null) ?? null;
  const orders: Order[] = (ordersResult.data as Order[] | null) ?? [];
  const lifetime = orders.find(
    (o) => o.product_type === "lifetime" && o.status === "paid",
  ) ?? null;

  return {
    subscription,
    lifetime,
    orders,
    hasAccess: lifetime !== null ||
      (subscription !== null && ["active", "past_due"].includes(subscription.status)),
  };
}
