/**
 * entitlements.ts — SERVER ONLY
 *
 * Two responsibilities:
 *  1. Parse the nxs_xxx API token back into a Supabase user UUID
 *  2. Check whether a user is allowed to access a given resource
 *
 * Access hierarchy (first match wins):
 *  - Lifetime order  → can access everything, forever
 *  - Active subscription → can access everything while active
 *  - Per-item order  → can access that specific component or template
 */

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

// ── Token parsing ─────────────────────────────────────────────────────────────

/**
 * Converts a Supabase UUID into an nxs_xxx API token.
 * Must stay in sync with the derivation in /dashboard/api-key/page.tsx.
 */
export function buildApiToken(userId: string): string {
  return `nxs_${userId.replace(/-/g, "")}`;
}

/**
 * Parses an nxs_xxx token back into a Supabase UUID.
 * Returns null if the token is malformed.
 *
 * UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 * Token format: nxs_<32 hex chars>
 */
export function parseApiToken(token: string): string | null {
  if (!token || !token.startsWith("nxs_")) return null;

  const hex = token.slice(4); // strip "nxs_"

  // Must be exactly 32 lowercase hex chars (UUID without dashes)
  if (!/^[0-9a-f]{32}$/.test(hex)) return null;

  // Reconstruct UUID: 8-4-4-4-12
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

// ── Entitlement checks ────────────────────────────────────────────────────────

/**
 * Returns true if the user has an active subscription (annual plan).
 * "Active" means status = 'active' or 'past_due' (grace period).
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
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
 */
async function hasLifetimeAccess(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_type", "lifetime")
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return data !== null;
}

/**
 * Returns true if the user purchased this specific component à la carte.
 */
async function hasPurchasedComponent(userId: string, slug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
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
 * Returns true if the user purchased this specific template à la carte.
 */
async function hasPurchasedTemplate(userId: string, slug: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_type", "template")
    .eq("product_slug", slug)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  return data !== null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Can this user download/access a given component slug?
 *
 * Checks in order:
 *  1. Lifetime order
 *  2. Active subscription
 *  3. Individual component purchase
 */
export async function canAccessComponent(
  userId: string,
  slug: string,
): Promise<boolean> {
  if (await hasLifetimeAccess(userId)) return true;
  if (await hasActiveSubscription(userId)) return true;
  if (await hasPurchasedComponent(userId, slug)) return true;
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
  if (await hasPurchasedTemplate(userId, slug)) return true;
  return false;
}

/**
 * Broad check: does this user have ANY premium access?
 * Used to show/hide upgrade banners.
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  if (await hasLifetimeAccess(userId)) return true;
  if (await hasActiveSubscription(userId)) return true;
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
