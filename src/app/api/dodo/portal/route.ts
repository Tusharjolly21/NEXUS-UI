import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createPortalLink } from "@/lib/dodo";

export const dynamic = "force-dynamic";

/**
 * Sends a signed-in buyer to Dodo's customer portal, where they can update their card, cancel the
 * yearly plan and download invoices. The Dodo customer ID comes from their own subscription or order
 * row, so nobody can open anyone else's portal.
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const back = (flag: string) => NextResponse.redirect(`${origin}/dashboard/billing?portal=${flag}`, 303);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?next=/dashboard/billing`, 303);

  if (!process.env.DODO_PAYMENTS_API_KEY) return back("unavailable");

  const admin = getAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("customer_id")
    .eq("user_id", user.id)
    .not("customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let customerId = sub?.customer_id ?? null;

  if (!customerId) {
    const { data: order } = await admin
      .from("orders")
      .select("customer_id")
      .eq("user_id", user.id)
      .not("customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    customerId = order?.customer_id ?? null;
  }
  if (!customerId) return back("none");

  try {
    const link = await createPortalLink(customerId, `${origin}/dashboard/billing`);
    return NextResponse.redirect(link, 303);
  } catch (err) {
    console.error("[dodo] portal link failed:", err);
    return back("error");
  }
}
