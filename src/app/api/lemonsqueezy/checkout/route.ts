import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  // Only the two plans are for sale: Pro (yearly) and All-Access (lifetime). Nothing is sold on its own.
  const body = await req.json().catch(() => ({})) as { plan?: string };
  const plan = body.plan ?? "lifetime";
  if (plan !== "annual" && plan !== "lifetime") {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const variantId = plan === "annual"
    ? process.env.LEMONSQUEEZY_VARIANT_ANNUAL
    : process.env.LEMONSQUEEZY_VARIANT_LIFETIME;
  const successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;

  if (!variantId) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 501 });
  }

  try {
    const checkoutUrl = await createCheckout({
      variantId,
      userId: user.id,
      email: user.email,
      successUrl,
      cancelUrl: `${origin}/pricing?checkout=cancel`,
      embed: true,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
