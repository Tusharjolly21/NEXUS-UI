import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { SLOT_CAPS, SLOTS_ENABLED, type SlotsResponse } from "@/lib/launch-slots";

/**
 * GET /api/slots: how many early slots each plan has taken, counted from the database. Only two numbers per
 * plan leave the server (taken, cap): no names, no emails. Cached at the edge for five minutes. When the
 * database can't be read the answer is "not enabled", never a guess, so the popup simply stays away.
 *
 * - All-Access: paid lifetime orders (a refund frees its slot).
 * - Pro: subscriptions that are active, or cancelled but still running to the end of what was paid for.
 */
const OFF: SlotsResponse = { enabled: false, plans: {} };
const CACHE = { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" };

export async function GET(request: Request) {
  const rl = rateLimit(`slots:${getClientIp(request)}`, 60, 60_000);
  if (!rl.success) return Response.json(OFF, { status: 429, headers: { "cache-control": "no-store" } });
  if (!SLOTS_ENABLED || !isSupabaseConfigured()) return Response.json(OFF, { headers: CACHE });

  try {
    const admin = getAdminClient();
    const now = new Date().toISOString();
    const [lifetime, yearly] = await Promise.all([
      admin.from("orders").select("id", { count: "exact", head: true }).eq("product_type", "lifetime").eq("status", "paid"),
      admin.from("subscriptions").select("id", { count: "exact", head: true }).or(`status.eq.active,ends_at.gt.${now}`),
    ]);
    if (lifetime.error || yearly.error || lifetime.count === null || yearly.count === null) {
      return Response.json(OFF, { headers: { "cache-control": "public, s-maxage=60" } });
    }
    const body: SlotsResponse = {
      enabled: true,
      plans: {
        lifetime: { taken: Math.min(lifetime.count, SLOT_CAPS.lifetime), cap: SLOT_CAPS.lifetime },
        yearly: { taken: Math.min(yearly.count, SLOT_CAPS.yearly), cap: SLOT_CAPS.yearly },
      },
    };
    return Response.json(body, { headers: CACHE });
  } catch {
    return Response.json(OFF, { headers: { "cache-control": "public, s-maxage=60" } });
  }
}
