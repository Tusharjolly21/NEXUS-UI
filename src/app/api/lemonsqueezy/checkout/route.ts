import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/lemonsqueezy";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to purchase." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    plan?: "annual" | "lifetime" | "template";
    templateSlug?: string;
  };
  const plan = body.plan ?? "lifetime";

  let variantId: string | undefined;
  let successUrl: string;
  let customData: Record<string, string> | undefined;

  const origin = new URL(req.url).origin;

  if (plan === "template") {
    const slug = body.templateSlug;
    if (!slug) return NextResponse.json({ error: "Missing templateSlug." }, { status: 400 });
    variantId = process.env.LEMONSQUEEZY_VARIANT_TEMPLATE;
    successUrl = `${origin}/templates/${slug}?checkout=success`;
    customData = { template_slug: slug };
  } else {
    variantId = plan === "annual"
      ? process.env.LEMONSQUEEZY_VARIANT_ANNUAL
      : process.env.LEMONSQUEEZY_VARIANT_LIFETIME;
    successUrl = `${origin}/dashboard?checkout=success&plan=${plan}`;
  }

  if (!variantId) {
    return NextResponse.json({ error: "Payment not configured." }, { status: 501 });
  }

  try {
    const checkoutUrl = await createCheckout({
      variantId,
      userId: user.id,
      email: user.email,
      successUrl,
      cancelUrl: plan === "template"
        ? `${origin}/templates/${body.templateSlug}?checkout=cancel`
        : `${origin}/pricing?checkout=cancel`,
      customData,
      embed: true,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
