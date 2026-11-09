import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, productIdForPlan, type Plan } from "@/lib/dodo";
import { getUserEntitlements } from "@/lib/entitlements";
import { summarisePlan } from "@/lib/plan";
import { regionFor } from "@/lib/region";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  // Only the two plans are for sale: Pro (yearly) and All-Access (lifetime). Nothing is sold on its own.
  const body = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan = (body.plan ?? "lifetime") as Plan;
  if (plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  // Don't take a second payment for something the buyer already has. Checked here, not just in the
  // UI, so a stale tab or a direct request can't double-charge.
  try {
    const { subscription, orders } = await getUserEntitlements(user.id);
    const current = summarisePlan(subscription, orders);
    if (current.kind === "lifetime") {
      return NextResponse.json({ error: "You already have All-Access, which includes everything." }, { status: 409 });
    }
    // A Pro plan that is renewing (or whose payment needs fixing) blocks another Pro purchase. One that is
    // set to end can be bought again once it has.
    if (plan === "annual" && current.kind === "yearly" && current.badge.label !== "Ending") {
      return NextResponse.json({ error: "You already have Pro. Manage it from Billing in your dashboard." }, { status: 409 });
    }
  } catch {
    // If the check itself fails, let checkout continue: the payment provider and webhook are the source of truth.
  }

  const region = regionFor(req.headers);
  if (!process.env.DODO_PAYMENTS_API_KEY || !productIdForPlan(plan, region)) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 501 });
  }

  const origin = new URL(req.url).origin;
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined;

  try {
    const url = await createCheckoutSession({
      plan,
      region,
      userId: user.id,
      email: user.email ?? undefined,
      name: fullName,
      // Access is granted by the webhook, never by this redirect.
      returnUrl: `${origin}/dashboard?checkout=success&plan=${plan}${region === "india" ? "&region=india" : ""}`,
      cancelUrl: `${origin}/pricing?checkout=cancel`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
