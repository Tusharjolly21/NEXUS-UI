import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { planForProductId, verifyWebhook } from "@/lib/dodo";

export const dynamic = "force-dynamic";

/**
 * Dodo Payments webhook. This is the only place that grants access:
 *  - payment.succeeded for the lifetime product -> an `orders` row (product_type "lifetime")
 *  - subscription.* for the yearly product      -> a `subscriptions` row kept in step with Dodo
 *  - refund.succeeded (full refund)             -> the order is marked refunded
 *
 * The `ls_*` columns are a legacy name from the previous payment provider; they now hold Dodo IDs
 * (ls_order_id = payment_id, ls_subscription_id = subscription_id, ls_product_id/ls_variant_id =
 * product_id).
 */

type Metadata = Record<string, string> | null | undefined;

type DodoPayment = {
  payment_id: string;
  total_amount: number;
  currency: string;
  metadata?: Metadata;
  product_cart?: { product_id: string }[] | null;
};

type DodoSubscription = {
  subscription_id: string;
  product_id: string;
  status: "pending" | "active" | "on_hold" | "paused" | "cancelled" | "failed" | "expired" | "past_due";
  next_billing_date?: string | null;
  expires_at?: string | null;
  metadata?: Metadata;
};

type DodoRefund = {
  refund_id: string;
  payment_id: string;
  is_partial: boolean;
};

type DodoEvent = { type: string; data: unknown };

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.active",
  "subscription.renewed",
  "subscription.updated",
  "subscription.plan_changed",
  "subscription.update_payment_method",
  "subscription.past_due",
  "subscription.on_hold",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
]);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hdrs = await headers();
  const webhookId = hdrs.get("webhook-id");

  const valid = verifyWebhook(rawBody, {
    id: webhookId,
    timestamp: hdrs.get("webhook-timestamp"),
    signature: hdrs.get("webhook-signature"),
  });
  if (!valid || !webhookId) {
    console.error("[dodo-webhook] invalid signature: check DODO_PAYMENTS_WEBHOOK_KEY matches the endpoint in the Dodo dashboard");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: DodoEvent;
  try {
    event = JSON.parse(rawBody) as DodoEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Idempotency: Dodo retries failed deliveries, so skip anything already processed.
  const { data: existing } = await supabase.from("webhook_events").select("id").eq("id", webhookId).maybeSingle();
  if (existing) return NextResponse.json({ received: true, skipped: true });

  try {
    if (event.type === "payment.succeeded") {
      const payment = event.data as DodoPayment;
      const userId = payment.metadata?.user_id;
      const lifetimeItem = payment.product_cart?.find((item) => planForProductId(item.product_id) === "lifetime");

      // Yearly payments are handled by the subscription events. Only the one-time product makes an order.
      if (userId && lifetimeItem) {
        const { error } = await supabase.from("orders").upsert(
          {
            user_id: userId,
            ls_order_id: payment.payment_id,
            ls_product_id: lifetimeItem.product_id,
            ls_variant_id: lifetimeItem.product_id,
            product_type: "lifetime",
            product_slug: null,
            status: "paid",
            amount_cents: payment.total_amount,
            currency: payment.currency ?? "USD",
          },
          { onConflict: "ls_order_id" },
        );
        if (error) throw error;
        console.log(`[dodo-webhook] lifetime order user=${userId} payment=${payment.payment_id}`);
      }
    } else if (event.type === "refund.succeeded") {
      const refund = event.data as DodoRefund;
      // A partial refund keeps access. A full refund ends it, as the terms say.
      if (!refund.is_partial) {
        const { error } = await supabase.from("orders").update({ status: "refunded" }).eq("ls_order_id", refund.payment_id);
        if (error) throw error;
      }
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      const sub = event.data as DodoSubscription;
      if (planForProductId(sub.product_id) === "annual") {
        const userId = sub.metadata?.user_id;
        const live = sub.status === "active" || sub.status === "past_due";
        const fields = {
          ls_product_id: sub.product_id,
          ls_variant_id: sub.product_id,
          status: sub.status,
          renews_at: live ? sub.next_billing_date ?? null : null,
          ends_at: sub.expires_at ?? null,
          updated_at: new Date().toISOString(),
        };

        if (userId) {
          const { error } = await supabase
            .from("subscriptions")
            .upsert({ user_id: userId, ls_subscription_id: sub.subscription_id, ...fields }, { onConflict: "ls_subscription_id" });
          if (error) throw error;
        } else {
          const { error } = await supabase.from("subscriptions").update(fields).eq("ls_subscription_id", sub.subscription_id);
          if (error) throw error;
        }
        console.log(`[dodo-webhook] ${event.type} sub=${sub.subscription_id} status=${sub.status}`);
      }
    }
  } catch (err) {
    // A 500 makes Dodo retry the delivery later.
    console.error(`[dodo-webhook] failed handling ${event.type}:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  await supabase.from("webhook_events").insert({ id: webhookId, event_name: event.type });
  return NextResponse.json({ received: true });
}
