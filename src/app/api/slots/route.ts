import { getAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { SLOT_CAPS, SLOTS_COUNT_FROM, SLOTS_ENABLED, SLOTS_IGNORE_USER_IDS, type SlotsResponse } from "@/lib/launch-slots";

/**
 * GET /api/slots: how many early slots each plan has taken, counted from the database. Only two numbers per
 * plan leave the server (taken, cap): no names, no emails. Cached at the edge for five minutes. When the
 * database can't be read the answer is "not enabled", never a guess, so the popup simply stays away.
 *
 * - All-Access: people with a paid lifetime order of more than zero (a refund or a free grant takes no slot).
 * - Pro: people with an active subscription (a cancelled one frees its slot).
 * Only purchases from SLOTS_COUNT_FROM onward count (earlier ones were test data). Each person counts once, and the accounts in SLOTS_IGNORE_USER_IDS (test purchases) never count.
 */
const OFF: SlotsResponse = { enabled: false, plans: {} };
const CACHE = { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" };

export async function GET(request: Request) {
  const rl = rateLimit(`slots:${getClientIp(request)}`, 60, 60_000);
  if (!rl.success) return Response.json(OFF, { status: 429, headers: { "cache-control": "no-store" } });
  if (!SLOTS_ENABLED || !isSupabaseConfigured()) return Response.json(OFF, { headers: CACHE });

  try {
    const admin = getAdminClient();
    const [lifetime, yearly] = await Promise.all([
      admin.from("orders").select("user_id").eq("product_type", "lifetime").eq("status", "paid").gt("amount_cents", 0).gte("created_at", SLOTS_COUNT_FROM).limit(1000),
      admin.from("subscriptions").select("user_id").eq("status", "active").gte("created_at", SLOTS_COUNT_FROM).limit(1000),
    ]);
    if (lifetime.error || yearly.error || !lifetime.data || !yearly.data) {
      return Response.json(OFF, { headers: { "cache-control": "public, s-maxage=60" } });
    }
    // One slot per person, however many orders or subscription rows they have, and never for the ignored accounts.
    const people = (rows: { user_id: string }[]) => new Set(rows.map((r) => r.user_id).filter((id) => !SLOTS_IGNORE_USER_IDS.includes(id))).size;
    const taken = { lifetime: people(lifetime.data), yearly: people(yearly.data) };
    const body: SlotsResponse = {
      enabled: true,
      plans: {
        lifetime: { taken: Math.min(taken.lifetime, SLOT_CAPS.lifetime), cap: SLOT_CAPS.lifetime },
        yearly: { taken: Math.min(taken.yearly, SLOT_CAPS.yearly), cap: SLOT_CAPS.yearly },
      },
    };
    return Response.json(body, { headers: CACHE });
  } catch {
    return Response.json(OFF, { headers: { "cache-control": "public, s-maxage=60" } });
  }
}
