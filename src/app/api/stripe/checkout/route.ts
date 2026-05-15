import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." },
      { status: 501 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    priceId?: string;
    mode?: "subscription" | "payment";
  } | null;

  const priceId =
    body?.priceId ||
    process.env.STRIPE_PRICE_PREMIUM_LIFETIME ||
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

  if (!priceId) {
    return NextResponse.json(
      { error: "Missing price id. Set STRIPE_PRICE_* env vars." },
      { status: 400 },
    );
  }

  const mode = body?.mode ?? (priceId.includes("month") ? "subscription" : "payment");

  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
