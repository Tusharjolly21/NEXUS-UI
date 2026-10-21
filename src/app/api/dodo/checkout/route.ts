import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, productIdForPlan, type Plan } from "@/lib/dodo";

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

  if (!process.env.DODO_PAYMENTS_API_KEY || !productIdForPlan(plan)) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 501 });
  }

  const origin = new URL(req.url).origin;
  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined;

  try {
    const url = await createCheckoutSession({
      plan,
      userId: user.id,
      email: user.email ?? undefined,
      name: fullName,
      // Access is granted by the webhook, never by this redirect.
      returnUrl: `${origin}/dashboard?checkout=success&plan=${plan}`,
      cancelUrl: `${origin}/pricing?checkout=cancel`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
