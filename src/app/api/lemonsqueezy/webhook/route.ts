import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

type LsOrderAttributes = {
  store_id: number;
  product_id: number;
  variant_id: number;
  status: string;
  total: number;
  currency: string;
  refunded: boolean;
};

type LsSubscriptionAttributes = {
  store_id: number;
  product_id: number;
  variant_id: number;
  status: "active" | "paused" | "cancelled" | "expired" | "past_due" | "unpaid";
  renews_at: string | null;
  ends_at: string | null;
};

type LsEvent = {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    attributes: LsOrderAttributes | LsSubscriptionAttributes;
  };
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hdrs = await headers();
  const signature = hdrs.get("x-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: LsEvent;
  try {
    event = JSON.parse(rawBody) as LsEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const eventName = event.meta.event_name;
  const eventId = `${eventName}::${event.data.id}`;

  // Idempotency — skip if already processed
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const userId = event.meta.custom_data?.user_id ?? null;

  // ── Handle events ──────────────────────────────────────────────
  switch (eventName) {
    case "order_created": {
      const attr = event.data.attributes as LsOrderAttributes;
      if (!userId) break;

      const isLifetime = String(attr.variant_id) === process.env.LEMONSQUEEZY_VARIANT_LIFETIME;

      await supabase.from("orders").insert({
        user_id: userId,
        ls_order_id: event.data.id,
        ls_product_id: String(attr.product_id),
        ls_variant_id: String(attr.variant_id),
        product_type: isLifetime ? "lifetime" : "component",
        status: "paid",
        amount_cents: attr.total,
        currency: attr.currency ?? "USD",
      });

      // Mark profile as premium
      await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", userId);
      break;
    }

    case "order_refunded": {
      await supabase
        .from("orders")
        .update({ status: "refunded" })
        .eq("ls_order_id", event.data.id);

      // Re-check if user still has another active access before removing premium
      if (userId) {
        const { data: activeOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "paid")
          .limit(1)
          .maybeSingle();

        const { data: activeSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .in("status", ["active", "past_due"])
          .limit(1)
          .maybeSingle();

        if (!activeOrder && !activeSub) {
          await supabase.from("profiles").update({ is_premium: false }).eq("id", userId);
        }
      }
      break;
    }

    case "subscription_created": {
      const attr = event.data.attributes as LsSubscriptionAttributes;
      if (!userId) break;

      await supabase.from("subscriptions").insert({
        user_id: userId,
        ls_subscription_id: event.data.id,
        ls_product_id: String(attr.product_id),
        ls_variant_id: String(attr.variant_id),
        status: attr.status,
        renews_at: attr.renews_at,
        ends_at: attr.ends_at,
      });

      await supabase.from("profiles").update({ is_premium: true }).eq("id", userId);
      break;
    }

    case "subscription_updated": {
      const attr = event.data.attributes as LsSubscriptionAttributes;
      await supabase
        .from("subscriptions")
        .update({
          status: attr.status,
          renews_at: attr.renews_at,
          ends_at: attr.ends_at,
          updated_at: new Date().toISOString(),
        })
        .eq("ls_subscription_id", event.data.id);
      break;
    }

    case "subscription_cancelled": {
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("ls_subscription_id", event.data.id);
      break;
    }

    case "subscription_expired": {
      await supabase
        .from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("ls_subscription_id", event.data.id);

      // Remove premium if no other access
      if (userId) {
        const { data: activeOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "paid")
          .eq("product_type", "lifetime")
          .limit(1)
          .maybeSingle();

        if (!activeOrder) {
          await supabase.from("profiles").update({ is_premium: false }).eq("id", userId);
        }
      }
      break;
    }

    case "subscription_payment_failed": {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due", updated_at: new Date().toISOString() })
        .eq("ls_subscription_id", event.data.id);
      break;
    }

    default:
      break;
  }

  // Record event for idempotency
  await supabase.from("webhook_events").insert({
    id: eventId,
    event_name: eventName,
  });

  return NextResponse.json({ received: true });
}
