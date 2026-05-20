import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { plan?: "annual" | "lifetime" };
  const plan = body.plan ?? "lifetime";

  const variantId =
    plan === "annual"
      ? process.env.LEMONSQUEEZY_VARIANT_ANNUAL
      : process.env.LEMONSQUEEZY_VARIANT_LIFETIME;

  if (!variantId) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 501 });
  }

  const origin = new URL(req.url).origin;

  try {
    const checkoutUrl = await createCheckout({
      variantId,
      userId: user.id,
      email: user.email,
      successUrl: `${origin}/dashboard?checkout=success&plan=${plan}`,
      cancelUrl: `${origin}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
